import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    UseFilters,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentsService } from './payments.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { HttpExceptionFilter } from '../filters/http-exception.filter';

@Controller('payments')
@UseFilters(HttpExceptionFilter)
export class PaymentsController {
    constructor(private paymentsService: PaymentsService) { }

    @Post('checkout')
    @HttpCode(HttpStatus.OK)
    async createCheckout(@Body() createCheckoutDto: CreateCheckoutDto) {
        return this.paymentsService.createCheckoutSession(createCheckoutDto);
    }

    @Get('order/:orderId')
    async getPaymentByOrderId(@Param('orderId') orderId: string) {
        return this.paymentsService.getPaymentByOrderId(orderId);
    }

    @Get('session/:sessionId')
    async getPaymentBySessionId(@Param('sessionId') sessionId: string) {
        return this.paymentsService.getPaymentBySessionId(sessionId);
    }

    @Get(':paymentId/logs')
    async getPaymentLogs(@Param('paymentId') paymentId: string) {
        return this.paymentsService.getPaymentLogs(paymentId);
    }

    @Post(':orderId/refund')
    async refundPayment(
        @Param('orderId') orderId: string,
        @Body() data?: { reason?: string },
    ) {
        return this.paymentsService.refundPayment(orderId, data?.reason);
    }

    // Microservice message patterns
    @MessagePattern({ cmd: 'create_checkout' })
    async handleCreateCheckout(@Payload() data: CreateCheckoutDto) {
        return this.paymentsService.createCheckoutSession(data);
    }

    @MessagePattern({ cmd: 'get_payment' })
    async handleGetPayment(@Payload() data: { orderId: string }) {
        return this.paymentsService.getPaymentByOrderId(data.orderId);
    }

    @MessagePattern({ cmd: 'refund_payment' })
    async handleRefundPayment(@Payload() data: { orderId: string; reason?: string }) {
        return this.paymentsService.refundPayment(data.orderId, data.reason);
    }
}
