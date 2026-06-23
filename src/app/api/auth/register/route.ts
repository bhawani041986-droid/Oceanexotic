import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { status: "error", message: 'Please provide all required fields.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { status: "error", message: 'A fleet node with this email is already commissioned.' },
        { status: 409 }
      );
    }

    // Hash the password securely
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Default status: Sellers might require approval, but let's default to ACTIVE for immediate entry unless otherwise specified
    const newStatus = 'ACTIVE';

    const uniqueId = Date.now();

    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          id: uniqueId,
          name,
          email,
          password: hashedPassword,
          role: role || 'customer',
          status: newStatus
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Generate a random session token
    const tokenArray = new Uint8Array(32);
    crypto.getRandomValues(tokenArray);
    const token = Array.from(tokenArray, dec => dec.toString(16).padStart(2, '0')).join('');

    // Attempt to send Welcome Email if SMTP is configured
    try {
      const nodemailer = require('nodemailer');
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const mailOptions = {
          from: `"OceanExotic Team" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Welcome to OceanExotic - Your Account Details',
          text: `Hello ${name},\n\nWelcome to the OceanExotic fleet! Your account has been successfully commissioned.\n\nYour Login Details:\nEmail: ${email}\nPassword: ${password}\n\nPlease keep this information secure.\n\nRegards,\nOceanExotic Team`,
        };

        await transporter.sendMail(mailOptions);
      }
    } catch (mailError) {
      console.warn("Failed to send welcome email:", mailError);
    }

    return NextResponse.json({
      success: true,
      token: token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error: any) {
    console.error("Auth register API error:", error);
    return NextResponse.json(
      { status: "error", message: 'Fleet registry failure: ' + error.message },
      { status: 500 }
    );
  }
}
