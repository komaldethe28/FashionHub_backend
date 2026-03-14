import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe';

// global variables
const currency = 'usd'
const deliveryCharge = 10
// gateway initialization
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// placing ordr with COD method 
const placeOrderCOD = async (req, res) => {
    console.log('placeOrderCOD controller called');
    console.log('Request body:', req.body);
    try {
        const { userId, items, amount, address } = req.body;
        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: 'COD',
            payment: false,
            date: Date.now(),
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId, { cartData: {} })

        res.json({ success: true, message: 'Order placed successfully' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// placing ordr with Stripe method
const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        const { origin } = req.headers;
        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: 'Stripe',
            payment: false,
            date: Date.now(),
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }))
        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: 'Delivery Charges'
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        })
        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment'
        })
        res.json({ success: true, session_url: session.url })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
// verify stripe payment and update order data
const verifyStripe = async (req, res) => {
    // authUser middleware populates req.body.userId from the token
    const { orderId, success } = req.body;
    const { userId } = req.body;

    try {
        if (!orderId) {
            return res.json({ success: false, message: 'Missing orderId' })
        }

        if (success === 'true') {
            await orderModel.findByIdAndUpdate(orderId, { payment: true })
            if (userId) {
                await userModel.findByIdAndUpdate(userId, { cartData: {} })
            }
            return res.json({ success: true, message: 'Payment successful and order placed' })
        } else {
            await orderModel.findByIdAndDelete(orderId)
            return res.json({ success: false, message: 'Payment failed, order cancelled' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

    // All order data for admin panel
    const allOrders = async (req, res) => {
        try {
            const orders = await orderModel.find({})
            res.json({ success: true, orders })
        } catch (error) {
            console.log(error)
            res.json({ success: false, message: error.message })
        }
    }

    // User order data for frontend order page
    const userOrders = async (req, res) => {
        try {

            const { userId } = req.body;
            const orders = await orderModel.find({ userId })
            res.json({ success: true, orders })

        } catch (error) {
            console.log(error)
            res.json({ success: false, message: error.message })
        }
    }

    // Update order status by admin
    const updateStatus = async (req, res) => {
        try {
            const { orderId, status } = req.body;
            await orderModel.findByIdAndUpdate(orderId, { status })
            res.json({ success: true, message: 'Order status updated successfully' })
        } catch (error) {
            console.log(error)
            res.json({ success: false, message: error.message })
        }
    }

    export { placeOrderCOD, placeOrderStripe, allOrders, userOrders, updateStatus , verifyStripe }