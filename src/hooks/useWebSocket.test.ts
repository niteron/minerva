import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWebSocket } from './useWebSocket.ts';

// amplify_outputs.json mock
vi.mock('../../amplify_outputs.json', () => ({
  default: {
    custom: {
      agentRuntimeArn: 'arn:aws:bedrock-agentcore:us-east-1:123456789012:runtime/test',
    },
  },
}));

// Amplify Auth mock (returns IAM credentials)
vi.mock('aws-amplify/auth', () => ({
  fetchAuthSession: async () => ({
    credentials: {
      accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
      secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      sessionToken: 'FwoGZXIvYXdzEBY...',
    },
  }),
}));

// SigV4 signer mock (class defined inside vi.mock factory)
vi.mock('@smithy/signature-v4', () => ({
  SignatureV4: class {
    async presign() {
      return {
        query: {
          qualifier: 'DEFAULT',
          'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
          'X-Amz-Credential': 'AKID/20260216/us-east-1/bedrock-agentcore/aws4_request',
          'X-Amz-Date': '20260216T000000Z',
          'X-Amz-Expires': '300',
          'X-Amz-SignedHeaders': 'host',
          'X-Amz-Signature': 'mock-signature',
          'X-Amz-Security-Token': 'mock-token',
        },
      };
    }
  },
}));

vi.mock('@smithy/protocol-http', () => ({
  HttpRequest: class {
    constructor(public opts: Record<string, unknown>) {}
  },
}));

vi.mock('@aws-crypto/sha256-js', () => ({ Sha256: class {} }));

// WebSocket mock
class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;
  static instances: MockWebSocket[] = [];
  readyState = MockWebSocket.OPEN;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  url: string;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
    setTimeout(() => this.onopen?.(), 0);
  }

  send = vi.fn();
  close = vi.fn(() => {
    this.onclose?.();
  });

  simulateMessage(data: Record<string, unknown>) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }
}

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.stubGlobal('WebSocket', MockWebSocket);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useWebSocket', () => {
  const defaultProps = {
    onAudio: vi.fn(),
    onTranscript: vi.fn(),
    onInterruption: vi.fn(),
    onToolUse: vi.fn(),
    onError: vi.fn(),
  };

  it('starts disconnected', () => {
    const { result } = renderHook(() => useWebSocket(defaultProps));
    expect(result.current.connectionStatus).toBe('disconnected');
  });

  it('opens WebSocket with SigV4 presigned URL on connect', async () => {
    const { result } = renderHook(() => useWebSocket(defaultProps));

    await act(async () => {
      await result.current.connect();
    });

    expect(MockWebSocket.instances).toHaveLength(1);
    const url = MockWebSocket.instances[0].url;
    // Validate presigned URL shape
    expect(url).toContain('wss://bedrock-agentcore.us-east-1.amazonaws.com');
    expect(url).toContain('qualifier=DEFAULT');
    expect(url).toContain('X-Amz-Algorithm=AWS4-HMAC-SHA256');
    expect(url).toContain('X-Amz-Signature=');
    // ARN must not be percent-encoded
    expect(url).not.toContain('arn%3A');
  });

  it('becomes connected after onopen', async () => {
    const { result } = renderHook(() => useWebSocket(defaultProps));

    await act(async () => {
      await result.current.connect();
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(result.current.connectionStatus).toBe('connected');
  });

  it('closes WebSocket on disconnect', async () => {
    const { result } = renderHook(() => useWebSocket(defaultProps));

    await act(async () => {
      await result.current.connect();
    });

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.connectionStatus).toBe('disconnected');
  });

  it('sends messages via send', async () => {
    const { result } = renderHook(() => useWebSocket(defaultProps));

    await act(async () => {
      await result.current.connect();
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    act(() => {
      result.current.send({ type: 'audio', audio: 'test' });
    });

    expect(MockWebSocket.instances[0].send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'audio', audio: 'test' })
    );
  });

  it('invokes onAudio for audio messages', async () => {
    const onAudio = vi.fn();
    const { result } = renderHook(() => useWebSocket({ ...defaultProps, onAudio }));

    await act(async () => {
      await result.current.connect();
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    act(() => {
      MockWebSocket.instances[0].simulateMessage({ type: 'audio', audio: 'AQID' });
    });

    expect(onAudio).toHaveBeenCalledWith('AQID');
  });

  it('invokes onTranscript for transcript messages', async () => {
    const onTranscript = vi.fn();
    const { result } = renderHook(() => useWebSocket({ ...defaultProps, onTranscript }));

    await act(async () => {
      await result.current.connect();
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    act(() => {
      MockWebSocket.instances[0].simulateMessage({
        type: 'transcript', role: 'assistant', text: 'hello', is_final: true,
      });
    });

    expect(onTranscript).toHaveBeenCalledWith('assistant', 'hello', true);
  });

  it('invokes onInterruption for interruption messages', async () => {
    const onInterruption = vi.fn();
    const { result } = renderHook(() => useWebSocket({ ...defaultProps, onInterruption }));

    await act(async () => {
      await result.current.connect();
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    act(() => {
      MockWebSocket.instances[0].simulateMessage({ type: 'interruption' });
    });

    expect(onInterruption).toHaveBeenCalledOnce();
  });
});
