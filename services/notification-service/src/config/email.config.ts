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
    cc?: string[];
    bcc?: string[];
}

interface EmailResponse {
    messageId: string;
    accepted: string[];
    rejected: string[];
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: nodemailer.Transporter;
    private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

    constructor() {
        this.initializeTransporter();
        this.precompileTemplates();
    }

    private initializeTransporter(): void {
        const host = process.env.MAIL_HOST || 'smtp.gmail.com';
        const port = parseInt(process.env.MAIL_PORT || '587', 10);
        const secure = process.env.MAIL_SECURE === 'true';
        const user = process.env.MAIL_USER;
        const password = process.env.MAIL_PASSWORD;

        if (!user || !password) {
            this.logger.error(
                'Email configuration is missing: MAIL_USER and MAIL_PASSWORD are required',
            );
            throw new Error('Email configuration is missing');
        }

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: {
                user,
                pass: password,
            },
        });

        this.logger.log('Email transporter initialized');
    }

    private precompileTemplates(): void {
        const templatesDir = process.env.TEMPLATES_DIR || 'src/email/templates';

        const templateFiles = [
            'order-confirmation',
            'payment-success',
            'payment-failed',
            'stock-alert',
        ];

        for (const templateName of templateFiles) {
            try {
                const templatePath = path.join(
                    process.cwd(),
                    templatesDir,
                    `${templateName}.hbs`,
                );

                if (fs.existsSync(templatePath)) {
                    const templateContent = fs.readFileSync(templatePath, 'utf-8');
                    const compiled = handlebars.compile(templateContent);
                    this.templates.set(templateName, compiled);
                    this.logger.log(`Template precompiled: ${templateName}`);
                } else {
                    this.logger.warn(`Template not found: ${templatePath}`);
                }
            } catch (error) {
                this.logger.error(
                    `Failed to precompile template ${templateName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                );
            }
        }
    }

    async sendEmail(options: EmailOptions): Promise<EmailResponse> {
        try {
            const template = this.templates.get(options.template);

            if (!template) {
                throw new Error(`Template not found: ${options.template}`);
            }

            const html = template(options.context);

            const result = await this.transporter.sendMail({
                from: `${process.env.MAIL_FROM_NAME || 'YouShop'} <${process.env.MAIL_FROM || 'noreply@youshop.com'}>`,
                to: options.to,
                cc: options.cc,
                bcc: options.bcc,
                subject: options.subject,
                html,
            });

            this.logger.log(
                `Email sent to ${options.to}: ${options.subject} (Message ID: ${result.messageId})`,
            );

            return {
                messageId: result.messageId || '',
                accepted: result.accepted as string[],
                rejected: result.rejected as string[],
            };
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
            items: Array<{
                sku: string;
                quantity: number;
                unitPrice: number;
                total: number;
            }>;
        },
    ): Promise<EmailResponse> {
        return this.sendEmail({
            to: email,
            subject: `Order Confirmation - ${orderData.orderId}`,
            template: 'order-confirmation',
            context: {
                orderId: orderData.orderId,
                customerName: orderData.customerName,
                items: orderData.items,
                subtotal: orderData.subtotal.toFixed(2),
                tax: orderData.tax.toFixed(2),
                totalPrice: orderData.totalPrice.toFixed(2),
                orderDate: new Date().toLocaleDateString(),
                supportEmail: 'support@youshop.com',
            },
        });
    }

    async sendPaymentSuccess(
        email: string,
        paymentData: {
            orderId: string;
            amount: number;
            transactionId: string;
            receiptUrl?: string;
        },
    ): Promise<EmailResponse> {
        return this.sendEmail({
            to: email,
            subject: `Payment Confirmed - Order ${paymentData.orderId}`,
            template: 'payment-success',
            context: {
                orderId: paymentData.orderId,
                amount: paymentData.amount.toFixed(2),
                transactionId: paymentData.transactionId,
                receiptUrl: paymentData.receiptUrl,
                date: new Date().toLocaleDateString(),
                supportEmail: 'support@youshop.com',
            },
        });
    }

    async sendPaymentFailed(
        email: string,
        paymentData: {
            orderId: string;
            failureReason: string;
            failureCode?: string;
        },
    ): Promise<EmailResponse> {
        return this.sendEmail({
            to: email,
            subject: `Payment Failed - Order ${paymentData.orderId}`,
            template: 'payment-failed',
            context: {
                orderId: paymentData.orderId,
                failureReason: paymentData.failureReason,
                failureCode: paymentData.failureCode || 'unknown',
                frontendUrl: process.env.FRONTEND_URL,
                supportEmail: 'support@youshop.com',
            },
        });
    }

    async sendStockAlert(
        adminEmails: string[],
        stockData: {
            productSku: string;
            productName: string;
            currentStock: number;
            threshold: number;
        },
    ): Promise<EmailResponse> {
        return this.sendEmail({
            to: adminEmails.join(','),
            subject: `Stock Alert: ${stockData.productSku} Below Threshold`,
            template: 'stock-alert',
            context: {
                productSku: stockData.productSku,
                productName: stockData.productName,
                currentStock: stockData.currentStock,
                threshold: stockData.threshold,
                date: new Date().toLocaleString(),
            },
        });
    }
}