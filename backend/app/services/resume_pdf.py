from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

from backend.app.models.profile import Profile
from backend.app.models.resume import Resume
from backend.app.models.user import User


def _safe(value) -> str:
    return "" if value is None else str(value)


def _p(text: str, style: ParagraphStyle) -> Paragraph:
    text = (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\n", "<br/>")
    )
    return Paragraph(text, style)


def build_resume_pdf(
    resume: Resume,
    profile: Profile | None,
    user: User,
) -> BytesIO:
    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title=resume.title,
        author=_safe(user.email),
    )

    styles = getSampleStyleSheet()

    name_style = ParagraphStyle(
        "ResumeName",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        spaceAfter=4,
    )

    position_style = ParagraphStyle(
        "ResumePosition",
        parent=styles["Normal"],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#2563eb"),
        spaceAfter=8,
    )

    contact_style = ParagraphStyle(
        "ResumeContact",
        parent=styles["Normal"],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#475569"),
        spaceAfter=12,
    )

    section_style = ParagraphStyle(
        "ResumeSection",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=10,
        spaceAfter=6,
    )

    body_style = ParagraphStyle(
        "ResumeBody",
        parent=styles["Normal"],
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#334155"),
        spaceAfter=5,
    )

    small_style = ParagraphStyle(
        "ResumeSmall",
        parent=body_style,
        fontSize=8.5,
        leading=12,
    )

    story = []

    first_name = _safe(getattr(profile, "first_name", None)) if profile else ""
    last_name = _safe(getattr(profile, "last_name", None)) if profile else ""
    full_name = " ".join(x for x in (first_name, last_name) if x).strip()
    full_name = full_name or "Candidate"

    story.append(_p(full_name, name_style))
    story.append(_p(_safe(resume.desired_position), position_style))

    contacts = [_safe(user.email)]

    phone = getattr(profile, "phone", None) if profile else None
    city = getattr(profile, "city", None) if profile else None
    github = getattr(profile, "github_url", None) if profile else None
    linkedin = getattr(profile, "linkedin_url", None) if profile else None

    if phone:
        contacts.append(_safe(phone))
    if city or resume.city:
        contacts.append(_safe(city or resume.city))
    if github:
        contacts.append(_safe(github))
    if linkedin:
        contacts.append(_safe(linkedin))

    story.append(_p(" · ".join(contacts), contact_style))

    story.append(_p("Resume", section_style))
    story.append(_p(_safe(resume.title), body_style))

    if resume.about:
        story.append(_p("About", section_style))
        story.append(_p(_safe(resume.about), body_style))

    profile_bio = getattr(profile, "bio", None) if profile else None
    if profile_bio:
        story.append(_p("Profile", section_style))
        story.append(_p(_safe(profile_bio), body_style))

    if resume.salary_expectation is not None:
        story.append(_p("Salary expectation", section_style))
        story.append(_p(_safe(resume.salary_expectation), body_style))

    skills = getattr(profile, "skills", None) if profile else None
    if skills:
        story.append(_p("Skills", section_style))
        story.append(_p(" · ".join(_safe(x) for x in skills), body_style))

    experience = getattr(profile, "experience", None) if profile else None
    if experience:
        story.append(_p("Experience", section_style))
        for item in experience:
            company = _safe(item.get("company"))
            position = _safe(item.get("position"))
            start_date = _safe(item.get("start_date"))
            end_date = _safe(item.get("end_date")) or "Present"
            description = _safe(item.get("description"))

            title = " — ".join(x for x in (position, company) if x)
            if title:
                story.append(_p(f"<b>{title}</b>", body_style))
            if start_date or end_date:
                story.append(_p(f"{start_date} – {end_date}", small_style))
            if description:
                story.append(_p(description, body_style))

    education = getattr(profile, "education", None) if profile else None
    if education:
        story.append(_p("Education", section_style))
        for item in education:
            institution = _safe(item.get("institution"))
            degree = _safe(item.get("degree"))
            field = _safe(item.get("field"))
            start_date = _safe(item.get("start_date"))
            end_date = _safe(item.get("end_date"))

            title = " — ".join(x for x in (degree, field) if x)
            if institution:
                story.append(_p(f"<b>{institution}</b>", body_style))
            if title:
                story.append(_p(title, body_style))
            if start_date or end_date:
                story.append(_p(f"{start_date} – {end_date}", small_style))

    languages = getattr(profile, "languages", None) if profile else None
    if languages:
        story.append(_p("Languages", section_style))
        for item in languages:
            story.append(
                _p(
                    f"{_safe(item.get('name'))} — {_safe(item.get('level'))}",
                    body_style,
                )
            )

    projects = getattr(profile, "projects", None) if profile else None
    if projects:
        story.append(_p("Projects", section_style))
        for item in projects:
            name = _safe(item.get("name"))
            description = _safe(item.get("description"))
            url = _safe(item.get("url"))

            if name:
                story.append(_p(f"<b>{name}</b>", body_style))
            if description:
                story.append(_p(description, body_style))
            if url:
                story.append(_p(url, small_style))

    document.build(story)
    buffer.seek(0)
    return buffer