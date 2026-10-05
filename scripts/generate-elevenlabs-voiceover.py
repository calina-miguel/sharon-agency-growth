import json
import os
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "assets" / "voiceover"

# Rachel is a clear, professional female ElevenLabs voice. Override with
# ELEVENLABS_VOICE_ID when you want to use a specific voice from your account.
VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")
MODEL_ID = os.environ.get("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2")
OUTPUT_FORMAT = os.environ.get("ELEVENLABS_OUTPUT_FORMAT", "mp3_44100_128")

SCRIPTS = [
    "Welcome to the Lead Acquisition System. This guided tour explains how the app helps an agency attract insurance buyers, recruit sales agents, review every lead, and track follow up from one workspace. Use the live preview on the right as the tour moves through each section.",
    "The system starts with two lead streams. One stream captures insurance buyers. The other captures sales agent candidates. Both streams use the same operating layer for intake, approval, scheduling, and reporting, so the team can grow without mixing audiences or losing control of follow up.",
    "The Command Center is the starting dashboard. The cards show buyer leads, agent leads, items waiting for approval, and approved opportunities. These cards are clickable, so a user can jump directly to the stored leads or schedule area instead of hunting through the navigation.",
    "Lead Engines explains where real leads come from. Buyer leads can come from Meta ads, Google Search, local content, and referral partners. Recruiting leads can come from LinkedIn, career search ads, and recruiting content. The important idea is that clicks, forms, comments, and replies feed the same intake process.",
    "The Schedule area keeps approved leads from getting stale. A user can select a lead, set the date and time, add notes, and choose an outcome. This gives the team a simple follow up calendar for buyer consultations and recruiting conversations.",
    "Lead Manager separates Customers and Clients from Sales Agents. Each tab has its own status view, workflow, follow up plan, campaign links, reporting points, and content plan. This keeps consumer acquisition and recruiting organized without forcing both into the same pipeline.",
    "The Customer Page is the buyer destination. It is designed for families, homeowners, and business owners who want help understanding life insurance, mortgage protection, or coverage needs. Submissions become intake records for review before the team reaches out.",
    "The Recruitment Page is the agent candidate destination. It focuses on licensing, mentorship, agency support, and sales opportunity fit. This keeps recruiting language away from consumer insurance offers and gives candidates a clear way to request details.",
    "Social Hub brings enrolled social accounts into one operating area. The user can review platform stats, generate posts, select enrolled accounts, publish or queue content, and see the posting log. This is also where the app explains that account enrollment is required before scans or publishing can run.",
    "Lead Intake turns raw interest into a reviewable record. A captured signal might be an ad click, page visit, comment, reply, or form response. Running intake creates a fit score, lead summary, recommended next step, and draft message for approval.",
    "Compliance Watch supports safer growth. It keeps trusted guidance close to the campaign workflow and reminds the team to review consent, claims, public copy, and outreach before changing scripts or launching new acquisition tactics.",
    "AEO Studio helps the agency answer questions that buyers and agent candidates already ask online. The goal is to turn search questions into plain language content, campaign hooks, and routes to the right page, while keeping public answers reviewable.",
    "The Approval Queue is the control point. Each lead shows its type, score, summary, draft response, and recommended next step. The team can approve or reject before anything moves into follow up, booking, or recruiting action.",
    "Campaign Builder creates links and outreach copy for specific audiences. The user chooses the stream, audience, and offer, then gets a campaign URL and message copy that can be used in ads, posts, email, or referral outreach.",
    "The app includes a dedicated Quick Start Guide page. Each guide card opens a real app section and highlights the actual controls, records, or work areas users should review. The app also keeps the profile menu, resizable sidebar, mobile navigation, light mode, dark mode, and reduced motion settings for daily use.",
    "Reporting gives the team a simple scorecard. It shows total captured leads, average fit score, pending approvals, approved opportunities, and the movement from capture to outcome. This helps the agency see whether campaigns are creating usable opportunities.",
]

MOBILE_SLIDE_01 = "Welcome to the Lead Acquisition System. This guided tour explains how the app helps an agency attract insurance buyers, recruit sales agents, review every lead, and track follow up from one workspace. Use the live preview at the bottom as the tour moves through each section."


def create_speech(api_key, text, output_path):
    query = urlencode({"output_format": OUTPUT_FORMAT})
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?{query}"
    body = {
        "text": text,
        "model_id": MODEL_ID,
        "voice_settings": {
            "stability": 0.58,
            "similarity_boost": 0.82,
            "style": 0.18,
            "use_speaker_boost": True,
        },
    }
    request = Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={
            "xi-api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=90) as response:
            output_path.write_bytes(response.read())
    except HTTPError as error:
        detail = error.read().decode("utf-8", "replace")
        raise SystemExit(f"ElevenLabs request failed for {output_path.name}: {error.code} {detail}") from error


def main():
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        raise SystemExit("Set ELEVENLABS_API_KEY before running this script.")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for index, script in enumerate(SCRIPTS, start=1):
        output_path = OUTPUT_DIR / f"slide-{index:02}.mp3"
        create_speech(api_key, script, output_path)
        print(f"Created {output_path.relative_to(ROOT)}")

    mobile_path = OUTPUT_DIR / "slide-01-mobile.mp3"
    create_speech(api_key, MOBILE_SLIDE_01, mobile_path)
    print(f"Created {mobile_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
