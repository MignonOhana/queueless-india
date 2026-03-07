import { NextResponse } from 'next/server';
import twilio from 'twilio';

/**
 * MOCK NOTIFICATION ENGINE API
 * Handles dispatching cross-channel operational alerts for QueueLess India.
 * If TWILIO_ACCOUNT_SID is provided, it uses the official Twilio SDK. Otherwise, mocks.
 */

// Init Twilio conditionally
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

interface NotifyRequest {
  tokenNumber: string;
  phoneNumber: string;
  orgName: string;
  event: 'JOINED' | 'APPROACHING' | 'CALLED';
  estimatedWaitMins?: number;
}

export async function POST(req: Request) {
  try {
    const body: NotifyRequest = await req.json();
    const { tokenNumber, phoneNumber, orgName, event, estimatedWaitMins } = body;

    let smsBody = "";
    
    switch (event) {
      case 'JOINED':
        smsBody = `Welcome to ${orgName}! Your QueueLess Token is ${tokenNumber}. Est wait: ${estimatedWaitMins} mins. Track live here: queueless.in/t/${tokenNumber}`;
        break;
      case 'APPROACHING':
        smsBody = `Alert: Your turn is approaching at ${orgName}! Token ${tokenNumber} is currently 3rd in line. Please head towards the waiting area.`;
        break;
      case 'CALLED':
        smsBody = `It's your turn! Token ${tokenNumber}, please proceed to the desk at ${orgName} immediately.`;
        break;
      default:
        smsBody = `Queue update for token ${tokenNumber} at ${orgName}.`;
    }

    if (client && fromNumber) {
      // Dispatch Real SMS
      await client.messages.create({
        body: smsBody,
        from: fromNumber,
        to: phoneNumber
      });
      console.log(`[TWILIO] SMS Sent to ${phoneNumber}: ${smsBody}`);
    } else {
      // Log the simulated mock message to the server console
      console.log('\n--- SIMULATED NOTIFICATION DISPATCH (No Twilio Keys) ---');
      console.log(`Channel: SMS & WhatsApp`);
      console.log(`To: ${phoneNumber}`);
      console.log(`Payload: ${smsBody}`);
      console.log('-------------------------------------------------------\n');
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    return NextResponse.json({
      success: true,
      message: "Notification dispatched successfully",
      deliveredTo: phoneNumber,
      eventTriggered: event,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Failed to parse notification payload", error);
    return NextResponse.json(
      { success: false, error: "Invalid request format" },
      { status: 400 }
    );
  }
}
