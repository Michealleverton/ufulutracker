require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { priceId } = req.body;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/cancel-subscription", async (req, res) => {
  try {
    const { customerId, userEmail } = req.body;
    
    console.log(`[CANCEL SUBSCRIPTION] Starting cancellation process`);
    console.log(`[CANCEL SUBSCRIPTION] Request data:`, { customerId, userEmail });
    
    let customer = null;
    
    // Find the customer
    if (customerId) {
      console.log(`[CANCEL SUBSCRIPTION] Searching by customer ID: ${customerId}`);
      try {
        customer = await stripe.customers.retrieve(customerId);
        console.log(`[CANCEL SUBSCRIPTION] Found customer by ID: ${customer.id} (${customer.email})`);
      } catch (error) {
        console.error(`[CANCEL SUBSCRIPTION] Customer ID not found:`, error.message);
      }
    }
    
    // If no customer ID or customer not found, search by email
    if (!customer && userEmail) {
      console.log(`[CANCEL SUBSCRIPTION] Searching for customer by email: ${userEmail}`);
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 10, // Get more customers to debug
      });
      
      console.log(`[CANCEL SUBSCRIPTION] Found ${customers.data.length} customers with email ${userEmail}`);
      
      if (customers.data.length > 0) {
        customer = customers.data[0];
        console.log(`[CANCEL SUBSCRIPTION] Using customer: ${customer.id} (Name: ${customer.name || 'No name'}, Email: ${customer.email})`);
      } else {
        // If no exact email match, search all customers and look for partial matches
        console.log(`[CANCEL SUBSCRIPTION] No exact email match, searching all recent customers...`);
        const allCustomers = await stripe.customers.list({
          limit: 100, // Get recent customers
        });
        
        console.log(`[CANCEL SUBSCRIPTION] Found ${allCustomers.data.length} total customers to search through`);
        
        // Look for customers with similar email or containing the username
        const emailUsername = userEmail.split('@')[0]; // Get part before @
        const possibleCustomer = allCustomers.data.find(cust => 
          cust.email?.toLowerCase().includes(emailUsername.toLowerCase()) ||
          cust.name?.toLowerCase().includes(emailUsername.toLowerCase()) ||
          cust.email?.toLowerCase() === userEmail.toLowerCase()
        );
        
        if (possibleCustomer) {
          customer = possibleCustomer;
          console.log(`[CANCEL SUBSCRIPTION] Found possible match: ${customer.id} (Name: ${customer.name || 'No name'}, Email: ${customer.email})`);
        } else {
          console.log(`[CANCEL SUBSCRIPTION] No customers found matching ${userEmail} or ${emailUsername}`);
        }
      }
    }
    
    if (!customer) {
      console.log("[CANCEL SUBSCRIPTION] No Stripe customer found - account may already be deleted or never existed");
      return res.json({
        success: true,
        message: "No Stripe customer found to delete"
      });
    }

    console.log(`[CANCEL SUBSCRIPTION] Found customer to process: ${customer.id} (${customer.email})`);
    
    // 1. First, cancel all subscriptions (active, trialing, etc.)
    console.log(`[CANCEL SUBSCRIPTION] Looking for subscriptions for customer: ${customer.id}`);
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 100 // Get all subscriptions for this customer
    });
    
    console.log(`Found ${subscriptions.data.length} subscriptions for customer ${customer.id}`);
    
    for (const subscription of subscriptions.data) {
      console.log(`Processing subscription ${subscription.id} with status: ${subscription.status}`);
      
      // Only cancel if it's not already canceled or incomplete_expired
      if (['active', 'trialing', 'past_due', 'unpaid', 'incomplete'].includes(subscription.status)) {
        try {
          await stripe.subscriptions.cancel(subscription.id);
          console.log(`Successfully cancelled subscription: ${subscription.id}`);
        } catch (subError) {
          console.error(`Error cancelling subscription ${subscription.id}:`, subError.message);
          // Continue with other subscriptions even if one fails
        }
      } else {
        console.log(`Subscription ${subscription.id} already in terminal state: ${subscription.status}`);
      }
    }
    
    // 2. Then delete the customer entirely
    console.log(`[CANCEL SUBSCRIPTION] Deleting customer: ${customer.id}`);
    await stripe.customers.del(customer.id);
    console.log(`[CANCEL SUBSCRIPTION] Successfully deleted Stripe customer: ${customer.id}`);
    
    res.json({
      success: true,
      message: "Subscription cancelled and customer deleted from Stripe",
      customerId: customer.id,
      subscriptionsCancelled: subscriptions.data.length
    });
    
  } catch (error) {
    console.error("[CANCEL SUBSCRIPTION] Error cancelling subscription and deleting customer:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/api/get-session", async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }
    
    console.log(`Retrieving session details for: ${sessionId}`);
    
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log("Session details:", {
      customer: session.customer,
      subscription: session.subscription,
      payment_status: session.payment_status
    });
    
    res.json({
      customer_id: session.customer,
      subscription_id: session.subscription,
      payment_status: session.payment_status,
      success: true
    });
    
  } catch (error) {
    console.error("Error retrieving session:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.post("/api/create-portal-session", async (req, res) => {
  try {
    const { customerId, userEmail } = req.body;
    
    console.log(`Creating portal session for customer: ${customerId || userEmail}`);
    
    let customer = null;
    
    // If we have a customer ID, use it directly
    if (customerId) {
      try {
        customer = await stripe.customers.retrieve(customerId);
      } catch (error) {
        console.error("Customer ID not found:", error.message);
      }
    }
    
    // If no customer ID or customer not found, search by email
    if (!customer && userEmail) {
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });
      
      if (customers.data.length > 0) {
        customer = customers.data[0];
      }
    }
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found"
      });
    }
    
    // Create the portal session with return URL
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `http://localhost:5173/plan-success`, // New success page for plan changes
    });
    
    res.json({
      success: true,
      url: portalSession.url
    });
    
  } catch (error) {
    console.error("Error creating portal session:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/api/create-basic-customer-and-checkout", async (req, res) => {
  try {
    const { userEmail, userName, priceId, planType } = req.body;
    
    console.log(`Creating customer and checkout for: ${userEmail}, planType: ${planType || 'premium'}`);
    
    let customer = null;
    
    // First check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });
    
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      console.log(`Found existing customer: ${customer.id}`);
    } else {
      // Create a customer
      customer = await stripe.customers.create({
        email: userEmail,
        name: userName,
        metadata: {
          source: 'free_user_upgrade'
        }
      });
      console.log(`Created new customer: ${customer.id}`);
    }
    
    let finalPriceId;
    
    // Use your existing $0 subscription price ID
    finalPriceId = priceId || 'price_1Rj9b7Apncs80C2oHFbyg25v';
    
    console.log(`Using price: ${finalPriceId}`);

    console.log(`Creating subscription with price: ${finalPriceId}`);
    
    // For $0 subscriptions, create the subscription directly
    if (finalPriceId === 'price_1Rj9b7Apncs80C2oHFbyg25v') {
      try {
        // Create subscription directly for $0 plans
        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: finalPriceId }],
          metadata: {
            source: 'free_user_upgrade'
          }
        });
        
        console.log(`Created $0 subscription: ${subscription.id} for customer: ${customer.id}`);
        
        // TODO: Update user plan in your database here
        // You'll need to add database connection logic to update the user's plan
        // Example: UPDATE profiles SET plan = 'premium' WHERE email = userEmail
        
        console.log(`Note: You should update the user's plan in your database for email: ${userEmail}`);
        
        // Return success with a redirect to success page
        res.json({ 
          success: true,
          url: `http://localhost:5173/success?subscription_id=${subscription.id}&customer_id=${customer.id}`,
          customerId: customer.id,
          subscriptionId: subscription.id,
          message: 'Subscription created successfully'
        });
      } catch (subscriptionError) {
        console.error('Error creating $0 subscription:', subscriptionError);
        res.status(500).json({ 
          success: false,
          error: 'Failed to create subscription: ' + subscriptionError.message 
        });
      }
    } else {
      // For paid subscriptions, use checkout session
      const sessionConfig = {
        mode: "subscription",
        customer: customer.id,
        payment_method_types: ["card"],
        line_items: [
          {
            price: finalPriceId,
            quantity: 1,
          },
        ],
        success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:5173/plan-success?canceled=true`,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
      };

      const session = await stripe.checkout.sessions.create(sessionConfig);

      console.log(`Created checkout session: ${session.id} for customer: ${customer.id}`);

      res.json({ 
        success: true,
        url: session.url,
        customerId: customer.id,
        sessionId: session.id
      });
    }
  } catch (error) {
    console.error("Error creating basic customer and checkout:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Webhook endpoint to handle subscription updates
app.post('/webhook/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // Add this to your .env file

  let event;

  try {
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      event = req.body;
    }
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.created':
      const subscription = event.data.object;
      console.log(`Subscription ${subscription.id} was ${event.type}`);
      
      // Here you would update your database with the new subscription status
      // You'll need to implement database connection logic here
      
      break;
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      console.log(`Subscription ${deletedSubscription.id} was cancelled`);
      
      // Handle subscription cancellation
      
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Example app listening on port ${process.env.SERVER_PORT}`);
});
