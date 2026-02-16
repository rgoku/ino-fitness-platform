"""Messaging — real DB queries with conversation threading."""
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import and_, case, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Message, User

router = APIRouter()


class MessageSend(BaseModel):
    recipient_id: str
    content: str
    attachment_type: str | None = None
    attachment_url: str | None = None


@router.get("/conversations")
async def list_conversations(
    user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    uid = user["id"]

    # Find all unique conversation partners
    # Subquery: latest message per conversation partner
    partner_id = case(
        (Message.sender_id == uid, Message.recipient_id),
        else_=Message.sender_id,
    ).label("partner_id")

    sub = (
        select(
            partner_id,
            func.max(Message.sent_at).label("last_at"),
        )
        .where(or_(Message.sender_id == uid, Message.recipient_id == uid))
        .group_by(partner_id)
        .subquery()
    )

    # Get partner user info + unread count
    conversations = []
    rows = (await db.execute(select(sub))).all()
    for row in rows:
        partner = (await db.execute(select(User).where(User.id == row.partner_id))).scalar_one_or_none()
        if not partner:
            continue

        # Last message
        last_msg = (await db.execute(
            select(Message).where(
                or_(
                    and_(Message.sender_id == uid, Message.recipient_id == row.partner_id),
                    and_(Message.sender_id == row.partner_id, Message.recipient_id == uid),
                )
            ).order_by(Message.sent_at.desc()).limit(1)
        )).scalar_one_or_none()

        # Unread count
        unread = (await db.execute(
            select(func.count()).where(
                Message.sender_id == row.partner_id,
                Message.recipient_id == uid,
                Message.read_at.is_(None),
            )
        )).scalar() or 0

        conversations.append({
            "partner_id": str(partner.id), "partner_name": partner.name,
            "avatar_url": partner.avatar_url,
            "last_message": last_msg.content[:80] if last_msg else "",
            "last_message_at": last_msg.sent_at.isoformat() if last_msg else "",
            "is_from_me": str(last_msg.sender_id) == uid if last_msg else False,
            "unread_count": unread,
        })

    conversations.sort(key=lambda c: c["last_message_at"], reverse=True)
    return {"data": conversations}


@router.get("/conversations/{other_user_id}")
async def get_conversation(
    other_user_id: str,
    user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    before: str | None = Query(None),
    limit: int = Query(50, ge=1, le=100),
):
    uid = user["id"]
    query = select(Message).where(
        or_(
            and_(Message.sender_id == uid, Message.recipient_id == other_user_id),
            and_(Message.sender_id == other_user_id, Message.recipient_id == uid),
        )
    ).order_by(Message.sent_at.desc()).limit(limit)

    if before:
        query = query.where(Message.sent_at < before)

    messages = (await db.execute(query)).scalars().all()
    return {
        "data": [
            {"id": str(m.id), "sender_id": str(m.sender_id), "content": m.content,
             "attachments": m.attachments or [], "read_at": m.read_at.isoformat() if m.read_at else None,
             "sent_at": m.sent_at.isoformat()}
            for m in reversed(messages)   # chronological order
        ],
        "has_more": len(messages) == limit,
    }


@router.post("/send", status_code=201)
async def send_message(
    body: MessageSend,
    user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    attachments = []
    if body.attachment_type and body.attachment_url:
        attachments = [{"type": body.attachment_type, "url": body.attachment_url}]

    msg = Message(
        sender_id=user["id"], recipient_id=body.recipient_id,
        content=body.content, attachments=attachments,
    )
    db.add(msg)
    await db.flush()
    return {"id": str(msg.id), "sent_at": msg.sent_at.isoformat()}


@router.post("/conversations/{other_user_id}/read")
async def mark_read(
    other_user_id: str,
    user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    # Mark all unread messages from other_user as read
    unread = (await db.execute(
        select(Message).where(
            Message.sender_id == other_user_id,
            Message.recipient_id == user["id"],
            Message.read_at.is_(None),
        )
    )).scalars().all()
    now = datetime.now(timezone.utc)
    for m in unread:
        m.read_at = now
    return {"marked": len(unread)}
