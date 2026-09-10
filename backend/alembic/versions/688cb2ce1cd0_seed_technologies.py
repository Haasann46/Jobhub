"""seed technologies

Revision ID: 688cb2ce1cd0
Revises: 204b68983c37
Create Date: 2026-08-26
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "688cb2ce1cd0"

down_revision: Union[str, None] = "204b68983c37"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    technologies_table = sa.table(
        "technologies",

        sa.column(
            "name",
            sa.String(length=100),
        ),

        sa.column(
            "slug",
            sa.String(length=100),
        ),
    )

    op.bulk_insert(
        technologies_table,
        [
            {
                "name": "Python",
                "slug": "python",
            },
            {
                "name": "FastAPI",
                "slug": "fastapi",
            },
            {
                "name": "Django",
                "slug": "django",
            },
            {
                "name": "Flask",
                "slug": "flask",
            },
            {
                "name": "JavaScript",
                "slug": "javascript",
            },
            {
                "name": "TypeScript",
                "slug": "typescript",
            },
            {
                "name": "React",
                "slug": "react",
            },
            {
                "name": "Next.js",
                "slug": "nextjs",
            },
            {
                "name": "Vue",
                "slug": "vue",
            },
            {
                "name": "Angular",
                "slug": "angular",
            },
            {
                "name": "Node.js",
                "slug": "nodejs",
            },
            {
                "name": "Java",
                "slug": "java",
            },
            {
                "name": "Spring",
                "slug": "spring",
            },
            {
                "name": "C#",
                "slug": "csharp",
            },
            {
                "name": ".NET",
                "slug": "dotnet",
            },
            {
                "name": "C++",
                "slug": "cpp",
            },
            {
                "name": "Go",
                "slug": "go",
            },
            {
                "name": "PHP",
                "slug": "php",
            },
            {
                "name": "Laravel",
                "slug": "laravel",
            },
            {
                "name": "Ruby",
                "slug": "ruby",
            },
            {
                "name": "Kotlin",
                "slug": "kotlin",
            },
            {
                "name": "Swift",
                "slug": "swift",
            },
            {
                "name": "SQL",
                "slug": "sql",
            },
            {
                "name": "PostgreSQL",
                "slug": "postgresql",
            },
            {
                "name": "MySQL",
                "slug": "mysql",
            },
            {
                "name": "MongoDB",
                "slug": "mongodb",
            },
            {
                "name": "Redis",
                "slug": "redis",
            },
            {
                "name": "Docker",
                "slug": "docker",
            },
            {
                "name": "Kubernetes",
                "slug": "kubernetes",
            },
            {
                "name": "Git",
                "slug": "git",
            },
            {
                "name": "GitHub",
                "slug": "github",
            },
            {
                "name": "GitLab",
                "slug": "gitlab",
            },
            {
                "name": "AWS",
                "slug": "aws",
            },
            {
                "name": "Azure",
                "slug": "azure",
            },
            {
                "name": "Google Cloud",
                "slug": "google-cloud",
            },
            {
                "name": "Linux",
                "slug": "linux",
            },
            {
                "name": "HTML",
                "slug": "html",
            },
            {
                "name": "CSS",
                "slug": "css",
            },
            {
                "name": "Tailwind CSS",
                "slug": "tailwind-css",
            },
            {
                "name": "Figma",
                "slug": "figma",
            },
            {
                "name": "TensorFlow",
                "slug": "tensorflow",
            },
            {
                "name": "PyTorch",
                "slug": "pytorch",
            },
            {
                "name": "Pandas",
                "slug": "pandas",
            },
            {
                "name": "NumPy",
                "slug": "numpy",
            },
        ],
    )


def downgrade() -> None:

    op.execute(
        """
        DELETE FROM technologies
        WHERE slug IN (
            'python',
            'fastapi',
            'django',
            'flask',
            'javascript',
            'typescript',
            'react',
            'nextjs',
            'vue',
            'angular',
            'nodejs',
            'java',
            'spring',
            'csharp',
            'dotnet',
            'cpp',
            'go',
            'php',
            'laravel',
            'ruby',
            'kotlin',
            'swift',
            'sql',
            'postgresql',
            'mysql',
            'mongodb',
            'redis',
            'docker',
            'kubernetes',
            'git',
            'github',
            'gitlab',
            'aws',
            'azure',
            'google-cloud',
            'linux',
            'html',
            'css',
            'tailwind-css',
            'figma',
            'tensorflow',
            'pytorch',
            'pandas',
            'numpy'
        );
        """
    )