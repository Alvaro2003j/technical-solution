import { Controller, Post, Body, Res, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Result } from 'typescript-result';
import { AppNotification } from '../../common/application/app.notification';
import { ApiController } from '../../common/api/api.controller';
import { RegisteredRequestRequest } from '../application/dtos/request/registered-request.request.dto';
import { RegisterRequestResponse } from '../application/dtos/response/registered-request-response.dto';
import { RequestApplicationService } from '../application/services/request-application.service';
import { GetRequestsQuery } from '../application/queries/get-request-query';
import { GetRequestByIdQuery } from '../application/queries/get-request-by-id.query';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('request')
@Controller('request')
export class RequestController {
    constructor(
       private readonly requestApplicationService: RequestApplicationService,
       private readonly queryBus: QueryBus
    ) {}

    @Post()
    @ApiOperation({ summary: 'Create new request'})
    @ApiResponse({
        status: 201,
        description: 'Request created',
    })
    async register(
        @Body() registeredRequestRequest: RegisteredRequestRequest,
        @Res({passthrough: true}) response
    ): Promise<object> {
        try{
            const result: Result<AppNotification, RegisterRequestResponse> = await this.requestApplicationService.register(registeredRequestRequest);
            if (result.isSuccess())
            {
                return ApiController.created(response, result.value);
            }
            return ApiController.error(response, result.error.getErrors());
        }
        catch (error)
        {
            return ApiController.serverError(response, error);
        }
    }

    @Get()
    @ApiOperation({ summary: 'Get all requests'})
    @ApiResponse({
        status: 200,
        description: 'All requests returned',
        isArray: true,
    })
    async getRequests(@Res({passthrough: true}) response) : Promise<object> 
    {
        try
        {
            const requests = await this.queryBus.execute(new GetRequestsQuery());
            return ApiController.ok(response, requests);
        }
        catch (error)
        {
            return ApiController.serverError(response, error);
        }
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Get request by id'})
    @ApiResponse({
        status: 200,
        description: 'Request returned',
    })
    async getById(@Param('id') requestId: number, @Res({passthrough: true}) response) : Promise<object>
    {
        try 
        {
            const request = await this.queryBus.execute(new GetRequestByIdQuery(requestId));
            return ApiController.ok(response, request);
        }
        catch(error)
        {
            return ApiController.serverError(response, error);
        }
    }
}
