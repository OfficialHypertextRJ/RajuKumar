'use client';

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import emailjs from 'emailjs-com';

// Email service configuration
// You need to replace these with your actual EmailJS service details
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_USER_ID = process.env.NEXT_PUBLIC_EMAILJS_USER_ID || '';

interface EmailResult {
  success: boolean;
  email: string;
  error?: any;
}

/**
 * Send newsletter to all active subscribers about a new blog post
 */
export async function sendNewPostNotification(postTitle: string, postExcerpt: string, postUrl: string) {
  try {
    // Check if EmailJS is properly configured
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_USER_ID) {
      console.error('EmailJS is not properly configured');
      throw new Error('Email service is not configured');
    }

    // Fetch all active subscribers
    const subscribersRef = collection(db, 'subscribers');
    const q = query(subscribersRef, where('active', '==', true));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('No active subscribers found');
      return { success: true, message: 'No subscribers to notify' };
    }

    const sendPromises: Promise<EmailResult>[] = [];
    let successCount = 0;
    let failedCount = 0;

    // Send email to each subscriber
    snapshot.forEach(doc => {
      const subscriber = doc.data();
      
      const emailParams = {
        to_email: subscriber.email,
        subject: `New Blog Post: ${postTitle}`,
        post_title: postTitle,
        post_excerpt: postExcerpt,
        post_url: postUrl,
        // Add any additional template parameters your EmailJS template uses
      };

      const sendPromise = emailjs
        .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, emailParams, EMAILJS_USER_ID)
        .then(response => {
          console.log(`Email successfully sent to ${subscriber.email}`, response);
          successCount++;
          return { success: true, email: subscriber.email };
        })
        .catch(error => {
          console.error(`Failed to send email to ${subscriber.email}`, error);
          failedCount++;
          return { success: false, email: subscriber.email, error };
        });

      sendPromises.push(sendPromise);
    });

    // Wait for all emails to be sent
    const results = await Promise.all(sendPromises);

    return {
      success: true,
      message: `Sent ${successCount} emails, ${failedCount} failed`,
      successCount,
      failedCount,
      results
    };
  } catch (error) {
    console.error('Error sending newsletter:', error);
    return { success: false, error };
  }
} 