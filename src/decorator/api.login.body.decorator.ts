import { applyDecorators } from "@nestjs/common";
import { ApiBody } from "@nestjs/swagger";
import { LoginBodyDto } from "src/user/dto/login-body.dto";

export function ApiLoginBody(){
    return applyDecorators(ApiBody({type:LoginBodyDto}))
}