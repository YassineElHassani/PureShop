import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

interface EmailOptions {
    to: string;
    subject: string;
    template: string;
    context: Record<string, any>;
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.MAIL_PORT || '587'),
            secure: process.env.MAIL_SECURE === 'true',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
            },
        });
    }

    async sendEmail(options: EmailOptions): Promise<void> {
        try {
            const templatePath = path.join(
                __dirname,
                'templates',
                `${options.template}.hbs`,
            );

            const templateContent = fs.readFileSync(templatePath, 'utf-8');
            const compiledTemplate = handlebars.compile(templateContent);
            const html = compiledTemplate(options.context);

            await this.transporter.sendMail({
                from: process.env.MAIL_FROM || 'noreply@youshop.com',
                to: options.to,
                subject: options.subject,
                html,
            });

            this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
        } catch (error) {
            this.logger.error(
                `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    async sendOrderConfirmation(
        email: string,
        orderData: {
            orderId: string;
            customerName: string;
            totalPrice: number;
            subtotal: number;
            tax: number;
            shipping?: number;
            currency?: string;
            items: { sku: string; name: string; quantity: number; unitPrice: number; totalPrice: number }[];
        },
    ): Promise<void> {
        await this.sendEmail({
            to: email,
            subject: `Order Confirmation - ${orderData.orderId}`,
            template: 'order-confirmation',
            context: {
                orderId: orderData.orderId,
                customerName: orderData.customerName,
                totalPrice: orderData.totalPrice.toFixed(2),
                subtotal: orderData.subtotal.toFixed(2),
                tax: orderData.tax.toFixed(2),
                shipping: (orderData.shipping || 0).toFixed(2),
                currency: orderData.currency || 'MAD',
                items: orderData.items.map(item => ({
                    sku: item.sku,
                    name: item.name,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice.toFixed(2),
                    total: item.totalPrice.toFixed(2),
                })),
                orderDate: new Date().toLocaleDateString(),
                supportEmail: process.env.MAIL_FROM || 'support@pureshop.com',
            },
        });
    }

    async sendPaymentSuccess(
        email: string,
        paymentData: {
            orderId: string;
            amount: number;
            transactionId: string;
            currency?: string;
            receiptUrl?: string;
        },
    ): Promise<void> {
        await this.sendEmail({
            to: email,
            subject: `Payment Confirmation - ${paymentData.orderId}`,
            template: 'payment-success',
            context: {
                orderId: paymentData.orderId,
                amount: paymentData.amount.toFixed(2),
                currency: paymentData.currency || 'MAD',
                transactionId: paymentData.transactionId,
                receiptUrl: paymentData.receiptUrl,
                date: new Date().toLocaleDateString(),
                supportEmail: process.env.MAIL_FROM || 'support@pureshop.com',
            },
        });
    }

    async sendPaymentFailed(
        email: string,
        paymentData: {
            orderId: string;
            failureReason: string;
            failureCode: string;
        },
    ): Promise<void> {
        await this.sendEmail({
            to: email,
            subject: `Payment Failed - ${paymentData.orderId}`,
            template: 'payment-failed',
            context: {
                orderId: paymentData.orderId,
                reason: paymentData.failureReason,
                failureCode: paymentData.failureCode,
                supportEmail: process.env.MAIL_FROM || 'support@pureshop.com',
            },
        });
    }

    async sendStockAlert(
        emails: string[],
        stockData: {
            productSku: string;
            productName: string;
            currentStock: number;
            threshold: number;
        },
    ): Promise<void> {
        await Promise.all(
            emails.map((email) =>
                this.sendEmail({
                    to: email,
                    subject: `Low Stock Alert - ${stockData.productSku}`,
                    template: 'stock-alert',
                    context: {
                        productSku: stockData.productSku,
                        productName: stockData.productName,
                        currentStock: stockData.currentStock,
                        threshold: stockData.threshold,
                        alertDate: new Date().toLocaleDateString(),
                    },
                }),
            ),
        );
    }
}