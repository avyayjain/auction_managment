from fastapi import APIRouter, Depends
from pydantic import BaseModel
from src.db.functions.add_user import create_user
from src.db.functions.logout import user_logout
from src.resources.token import UserBase, get_current_active_user

add_user_router = APIRouter()


class AuthAddUser(BaseModel):
    email: str
    password: str
    name: str
    user_type: str


class DeleteUser(BaseModel):
    email: str


@add_user_router.post("/")
async def sign_up(
    form_data: AuthAddUser
):
    """
    API to ADD Users

    """
    try:
        create_user(
            user_type=form_data.user_type,
            user_email=form_data.email,
            password=form_data.password,
            user_name=form_data.name,
        )
        return {"detail": "User Added ,please login to continue"}
    except Exception as e:
        print(e,"error")


@add_user_router.delete("/delete_user")
async def delete_user(
    form_data: DeleteUser, current_user: UserBase = Depends(get_current_active_user)
):
    """
    API to ADD Users
    """
    try:
        try:
            user_logout(form_data.email)
        except Exception as e:
            print(e)
        return {"detail": "User Delete"}

    except Exception as e:
        print(e)