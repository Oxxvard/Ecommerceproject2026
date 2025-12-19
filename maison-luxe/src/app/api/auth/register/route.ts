import { NextResponse, NextRequest } from 'next/server';
import logger from '@/lib/logger';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { RegisterSchema } from '@/lib/schemas';
import { errorResponse, formatZodError } from '@/lib/errors';
import { withBodyValidation } from '@/lib/validation';

export const POST = withBodyValidation(RegisterSchema, async (request: NextRequest, _session, data) => {
  try {
    const { name, email, password } = data;

    await dbConnect();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        errorResponse('USER_EXISTS', 'Cet email est déjà utilisé'),
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });

    return NextResponse.json(
      {
        message: 'Utilisateur créé avec succès',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error('Erreur inscription:', error);
    return NextResponse.json(
      errorResponse('INTERNAL_SERVERerror', 'Erreur lors de l\'inscription'),
      { status: 500 }
    );
  }
});
