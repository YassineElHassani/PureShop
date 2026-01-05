import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseFilters,
  Inject,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { CreateCheckoutDto } from '../dto/create-checkout.dto';
import { RefundPaymentDto } from '../dto/refund-payment.dto';

@ApiTags('Payments')
@Controller('payments')
@UseFilters(HttpExceptionFilter)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(
    @Inject('PAYMENT_SERVICE') private paymentClient: ClientProxy,
  ) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Create a Stripe checkout session' })
  @ApiResponse({ status: 201, description: 'Checkout session created successfully', schema: {
    example: {
      sessionId: 'cs_test_abc123',
      sessionUrl: 'https://checkout.stripe.com/pay/cs_test_abc123',
      orderId: 'ord_123',
    }
  }})
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createCheckout(@Body() createCheckoutDto: CreateCheckoutDto, @Request() req: any) {
    const userId = req.user?.sub;
    const userEmail = req.user?.email;
    
    return firstValueFrom(
      this.paymentClient.send(
        { cmd: 'create_checkout' },
        { ...createCheckoutDto, userId, customerEmail: userEmail },
      ).pipe(timeout(10000)),
    );
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get payment status by order ID' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Payment status retrieved successfully', schema: {
    example: {
      id: 'pay_123',
      orderId: 'ord_123',
      status: 'succeeded',
      amount: 15000,
      currency: 'mad',
      stripePaymentIntentId: 'pi_abc123',
      createdAt: '2026-01-13T12:00:00.000Z',
    }
  }})
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentByOrderId(@Param('orderId') orderId: string, @Request() req: any) {
    const userId = req.user?.sub;
    
    return firstValueFrom(
      this.paymentClient.send(
        { cmd: 'get_payment_by_order' },
        { orderId, userId },
      ).pipe(timeout(5000)),
    );
  }

  @Get(':paymentId')
  @ApiOperation({ summary: 'Get payment details by payment ID' })
  @ApiParam({ name: 'paymentId', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment details retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentById(@Param('paymentId') paymentId: string, @Request() req: any) {
    const userId = req.user?.sub;
    
    return firstValueFrom(
      this.paymentClient.send(
        { cmd: 'get_payment' },
        { paymentId, userId },
      ).pipe(timeout(5000)),
    );
  }

  @Post('refund/:orderId')
  @ApiOperation({ summary: 'Refund a payment' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully', schema: {
    example: {
      id: 'pay_123',
      status: 'refunded',
      refundId: 're_abc123',
      refundedAmount: 15000,
    }
  }})
  @ApiResponse({ status: 400, description: 'Payment cannot be refunded' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async refundPayment(
    @Param('orderId') orderId: string,
    @Body() refundPaymentDto: RefundPaymentDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub;
    
    return firstValueFrom(
      this.paymentClient.send(
        { cmd: 'refund_payment' },
        { orderId, userId, ...refundPaymentDto },
      ).pipe(timeout(10000)),
    );
  }
}
