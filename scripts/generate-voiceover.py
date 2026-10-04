from pathlib import Path
import subprocess
import tempfile

import soundfile as sf
from kokoro_onnx import Kokoro


ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "tmp" / "kokoro" / "kokoro-v1.0.onnx"
VOICES_PATH = ROOT / "tmp" / "kokoro" / "voices-v1.0.bin"
OUTPUT_DIR = ROOT / "assets" / "voiceover"
VOICE = "af_bella"
SPEED = 0.92

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
    "The app includes practical controls for daily use and presentation settings. The profile menu opens from the avatar, the sidebar resizes on desktop, the mobile menu collapses navigation, and light, dark, and reduced motion settings support different environments.",
    "Reporting gives the team a simple scorecard. It shows total captured leads, average fit score, pending approvals, approved opportunities, and the movement from capture to outcome. This helps the agency see whether campaigns are creating usable opportunities.",
]


def main():
    if not MODEL_PATH.exists() or not VOICES_PATH.exists():
        raise SystemExit("Missing Kokoro model files in tmp/kokoro.")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    kokoro = Kokoro(str(MODEL_PATH), str(VOICES_PATH))

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        for index, script in enumerate(SCRIPTS, start=1):
            wav_path = temp_path / f"slide-{index:02}.wav"
            mp3_path = OUTPUT_DIR / f"slide-{index:02}.mp3"
            samples, sample_rate = kokoro.create(script, voice=VOICE, speed=SPEED, lang="en-us")
            sf.write(wav_path, samples, sample_rate)
            subprocess.run(
                [
                    "ffmpeg",
                    "-y",
                    "-i",
                    str(wav_path),
                    "-codec:a",
                    "libmp3lame",
                    "-b:a",
                    "80k",
                    "-ar",
                    "24000",
                    "-ac",
                    "1",
                    str(mp3_path),
                ],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            print(f"Created {mp3_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
