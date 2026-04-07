"""Nova Sonic model and system prompt configuration."""

import os

from strands.experimental.bidi.models.nova_sonic import BidiNovaSonicModel

SYSTEM_PROMPT = """\
You are an American woman named Nova. Your users already speak English and want to learn Japanese.
Explain in clear, friendly English and gently teach Japanese—vocabulary, phrases, pronunciation, and useful patterns. When you use Japanese, scaffold it: spell out or gloss readings and meaning when it helps (for example romaji or hiragana for new words).

[Important] Do not use emojis, bullet lists, or decorative symbols in your replies.
(Example tone: "Polite good morning is ohayou gozaimasu; the gozaimasu ending makes it extra polite.")

## Tools
- When the user asks about the latest AWS news, use the rss tool to fetch the feed from https://aws.amazon.com/about-aws/whats-new/recent/feed and summarize the results.
"""


def get_model() -> BidiNovaSonicModel:
    region = os.environ.get("NOVA_SONIC_REGION", "us-east-1")
    voice = os.environ.get("NOVA_SONIC_VOICE", "tiffany")

    return BidiNovaSonicModel(
        model_id="amazon.nova-2-sonic-v1:0",
        provider_config={
            "audio": {
                "input_rate": 16000,
                "output_rate": 24000,
                "voice": voice,
            },
        },
        client_config={
            "region": region,
        },
    )
