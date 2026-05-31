from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime,
)

from sqlalchemy.orm import relationship

from datetime import datetime

from app.db.database import Base


class ArchitectureRun(Base):

    __tablename__ = "architecture_runs"

    __allow_unmapped__ = True

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)

    requirements = Column(Text)

    architecture_style = Column(String)

    confidence = Column(Integer)

    reasoning = Column(Text)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    status = Column(
        String,
        default="Draft"
    )

    services = relationship(
        "Service",
        back_populates="architecture_run"
    )

    infrastructure = relationship(
        "Infrastructure",
        back_populates="architecture_run"
    )

    retrieval_count = Column(
        Integer,
        default=0,
    )

    retrieval_source = Column(
        String,
        default="chromadb",
    )

    retrieved_architectures = Column(
        Text,
        default="[]",
    )


class Service(Base):

    __tablename__ = "services"

    __allow_unmapped__ = True

    id = Column(Integer, primary_key=True)

    architecture_run_id = Column(
        Integer,
        ForeignKey("architecture_runs.id")
    )

    name = Column(String)

    description = Column(Text)

    technology_stack = Column(Text)

    architecture_run = relationship(
        "ArchitectureRun",
        back_populates="services"
    )


class Infrastructure(Base):

    __tablename__ = "infrastructure"

    __allow_unmapped__ = True

    id = Column(Integer, primary_key=True)

    architecture_run_id = Column(
        Integer,
        ForeignKey("architecture_runs.id")
    )

    component = Column(String)

    technology = Column(String)

    rationale = Column(Text)

    architecture_run = relationship(
        "ArchitectureRun",
        back_populates="infrastructure"
    )