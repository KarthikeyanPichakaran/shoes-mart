import { getResend, FROM_EMAIL } from './resend'
import { formatPrice, calculateShipping, SHIPPING_FEE } from './utils'
import type { ShippingAddress } from '@/types'

interface OrderItem {
  product_id: string
  quantity: number
  size: number
  price_at_purchase: number
}

interface SendOrderConfirmationParams {
  to: string
  orderId: string
  orderItems: OrderItem[]
  productNames: Record<string, string>
  shippingAddress: ShippingAddress
  subtotal: number
  shippingAmount: number
  totalAmount: number
}

export async function sendOrderConfirmation({
  to,
  orderId,
  orderItems,
  productNames,
  shippingAddress,
  subtotal,
  shippingAmount,
  totalAmount,
}: SendOrderConfirmationParams) {
  const shortId = orderId.split('-')[0].toUpperCase()

  const itemRows = orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
          <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">
            ${productNames[item.product_id] ?? 'Product'}
          </p>
          <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">
            UK Size ${item.size} &times; ${item.quantity}
          </p>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;text-align:right;font-size:14px;font-weight:600;color:#111827;">
          ${formatPrice(item.price_at_purchase * item.quantity)}
        </td>
      </tr>`
    )
    .join('')

  const addressLines = [
    shippingAddress.line1,
    shippingAddress.line2,
    `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.pincode}`,
    shippingAddress.phone,
  ]
    .filter(Boolean)
    .join('<br/>')

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#111827;padding:28px 32px;">
              <p style="margin:0;font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                Shoe-Mart<span style="color:#dc2626;">.</span>
              </p>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:32px 32px 24px;border-bottom:1px solid #f3f4f6;">
              <p style="margin:0 0 8px;font-size:28px;">🎉</p>
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#111827;">
                Order Confirmed!
              </h1>
              <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
                Hi ${shippingAddress.full_name}, your payment was successful.
                We&apos;ll get your order packed and on its way soon.
              </p>
              <p style="margin:16px 0 0;display:inline-block;background:#f3f4f6;border-radius:8px;padding:8px 14px;font-size:13px;color:#374151;">
                Order ID: <strong style="font-family:monospace;">#${shortId}</strong>
              </p>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="padding:24px 32px;">
              <p style="margin:0 0 16px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;">
                Items Ordered
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemRows}
              </table>

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#6b7280;">Subtotal</td>
                  <td style="padding:6px 0;font-size:13px;color:#6b7280;text-align:right;">${formatPrice(subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#6b7280;">Shipping</td>
                  <td style="padding:6px 0;font-size:13px;color:#6b7280;text-align:right;">
                    ${shippingAmount === 0 ? '<span style="color:#16a34a;">Free</span>' : formatPrice(SHIPPING_FEE)}
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0 0;font-size:15px;font-weight:700;color:#111827;border-top:2px solid #f3f4f6;">Total Paid</td>
                  <td style="padding:12px 0 0;font-size:15px;font-weight:700;color:#111827;border-top:2px solid #f3f4f6;text-align:right;">${formatPrice(totalAmount)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping address -->
          <tr>
            <td style="padding:0 32px 24px;">
              <div style="background:#f9fafb;border-radius:12px;padding:16px 20px;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;">
                  Delivering to
                </p>
                <p style="margin:0;font-size:13px;color:#374151;line-height:1.7;">
                  <strong>${shippingAddress.full_name}</strong><br/>
                  ${addressLines}
                </p>
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/orders"
                 style="display:inline-block;background:#dc2626;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:999px;">
                View Your Orders
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                &copy; ${new Date().getFullYear()} Shoe-Mart. Payments secured by Razorpay.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Order Confirmed — #${shortId} 🎉`,
    html,
  })
}
