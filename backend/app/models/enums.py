from enum import Enum


class UserRole(str, Enum):
    CANDIDATE = "candidate"
    EMPLOYER = "employer"
    ADMIN = "admin"


class EmploymentType(str, Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"
    FREELANCE = "freelance"


class ExperienceLevel(str, Enum):
    INTERN = "intern"
    JUNIOR = "junior"
    MIDDLE = "middle"
    SENIOR = "senior"
    LEAD = "lead"


class VacancyCategory(str, Enum):
    BACKEND = "backend"
    FRONTEND = "frontend"
    DEVOPS = "devops"
    MOBILE = "mobile"
    QA = "qa"
    DESIGN = "design"
    AI = "ai"
    DATA = "data"


class ApplicationStatus(str, Enum):
    NEW = "new"
    REVIEWING = "reviewing"
    INTERVIEW = "interview"
    REJECTED = "rejected"
    HIRED = "hired"


class NotificationType(str, Enum):
    NEW_APPLICATION = "new_application"
    NEW_MESSAGE = "new_message"
    APPLICATION_STATUS_CHANGED = "application_status_changed"
    INVITATION = "invitation"
    NEW_VACANCY = "new_vacancy"