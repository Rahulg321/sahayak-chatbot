'use server';

import { z } from 'zod';
import { createUser, db, getPasswordResetTokenByToken, getUser, getVerificationTokenByToken } from '@/lib/db/queries';
import { signIn } from './auth';
import { authFormSchema, newPasswordFormSchema, resetPasswordFormSchema } from '@/lib/schemas/auth-schema';
import { generatePasswordResetToken, generateVerificationToken } from '@/lib/tokens';
import { sendPasswordResetEmail, sendVerificationTokenEmail } from '@/lib/mail';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { AuthError } from 'next-auth';
import { passwordResetToken, user, verificationToken } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateHashedPassword } from '@/lib/db/utils';

export interface LoginActionState {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "invalid_data"
    | "user_not_found"
    | "invalid_method";
}

export const login = async (
  _: LoginActionState,
  formData: FormData
): Promise<LoginActionState> => {
  const validatedData = authFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedData.success) {
    return { status: "invalid_data" };
  }

  const { email, password } = validatedData.data;

  const existingUser = (await getUser(email))?.[0];

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { status: "user_not_found" };
  }

  if (!existingUser.password) {
    return { status: "invalid_method" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: `${DEFAULT_LOGIN_REDIRECT}?login=success`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { status: "failed" };
        default:
          throw error;
      }
    }
    throw error;
  }

    return {
    status: "success",
  };
};

export interface RegisterActionState {
  status:
    | "idle"
    | "in_progress"
    | "failed"
    | "user_exists"
    | "sent_email"
    | "invalid_data";
}

export const register = async (
  _: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    console.log("validatedData", validatedData);

    const generatedUser = (await getUser(validatedData.email))?.[0];
    console.log("generatedUser", generatedUser);

    if (generatedUser) {
      if (generatedUser.emailVerified) {
        console.log("user exists");
        return { status: "user_exists" };
      } else {
        console.log("user exists but not verified");
        const newVerificationToken = await generateVerificationToken(
          validatedData.email
        );

        console.log("newVerificationToken", newVerificationToken);

        let emailSent = false;

        const emailResponse = await sendVerificationTokenEmail(
          validatedData.email,
          newVerificationToken.token
        );

        if (emailResponse.error) {
          return { status: "failed" };
        }

        emailSent = true;

        return { status: "sent_email" };
      }
    }

    await createUser(validatedData.email, validatedData.password);

    const verificationToken = await generateVerificationToken(
      validatedData.email
    );

    console.log("verificationToken", verificationToken);

    const emailResponse = await sendVerificationTokenEmail(
      validatedData.email,
      verificationToken.token
    );

    if (emailResponse.error) {
      await db.delete(user).where(eq(user.email, validatedData.email));
      return { status: "failed" };
    }

    return { status: "sent_email" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    console.log("An error occured trying to register", error);

    return { status: "failed" };
  }
};

export interface NewPasswordVerificationActionState {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "invalid_data"
    | "expired_token"
    | "invalid_token"
    | "user_not_found";
}

/**
 * Verifies a user's password
 *this is the new password that the user enters, we verify the token first and only if the token is valid, we allow the user to change thier password
 * 
 *  
 * 
 * @param _ - The state of the action
 * @param formData - The form data containing the new password
 * @returns The status of the verification
 */
export const newPasswordVerification = async (
  _: NewPasswordVerificationActionState,
  formData: FormData
): Promise<NewPasswordVerificationActionState> => {
  try {
    const validatedData = newPasswordFormSchema.parse({
      password: formData.get("password"),
      token: formData.get("token"),
    });

    const token = validatedData.token;

    const foundPasswordResetToken = await getPasswordResetTokenByToken(token);

    if (!foundPasswordResetToken) {
      return { status: "invalid_token" };
    }

    if (foundPasswordResetToken.expires < new Date()) {
      return { status: "expired_token" };
    }

    const existingUser = (await getUser(foundPasswordResetToken.email))?.[0];

    if (!existingUser) {
      return { status: "user_not_found" };
    }

    const hashedPassword = generateHashedPassword(validatedData.password);

    await db
      .update(user)
      .set({ password: hashedPassword })
      .where(eq(user.id, existingUser.id));

    await db
      .delete(passwordResetToken)
      .where(eq(passwordResetToken.id, foundPasswordResetToken.id));

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};



export interface ResetPasswordActionState {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "invalid_method"
    | "invalid_data"
    | "user_not_found";
}

export const resetPassword = async (
  _: ResetPasswordActionState,
  formData: FormData
): Promise<ResetPasswordActionState> => {
  try {
    const validatedData = resetPasswordFormSchema.parse({
      email: formData.get("email"),
    });

    console.log("validatedData", validatedData);

    const existingUser = (await getUser(validatedData.email))?.[0];

    if (!existingUser) {
      return { status: "user_not_found" };
    }

    if (!existingUser.password) {
      return { status: "invalid_method" };
    }

    const newPasswordResetToken = await generatePasswordResetToken(
      existingUser.email
    );

    const emailResponse = await sendPasswordResetEmail(
      existingUser.email,
      newPasswordResetToken.token
    );

    if (emailResponse.error) {
      return { status: "failed" };
    }

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};



export interface NewVerificationActionState {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "invalid_token"
    | "expired_token"
    | "user_not_found";
}

/**
 * Verifies a user's email
 * @param token - The token to verify the user's email
 * @returns The status of the verification
 */
export const newVerification = async (
  token: string
): Promise<NewVerificationActionState> => {
  const foundVerificationToken = await getVerificationTokenByToken(token);


  if (!foundVerificationToken) {
    console.log("Token not found");
    return { status: "invalid_token" };
  }

  if (foundVerificationToken.expires < new Date()) {
    console.log("Token expired");
    return { status: "expired_token" };
  }

  const existingUser = (await getUser(foundVerificationToken.email))?.[0];

  if (!existingUser) {
    console.log("User not found");
    return { status: "user_not_found" };
  }

  console.log("existingUser", existingUser);

  try {
    console.log("getting the users email verified")
    
    console.log("updating the user email verified")
   
    
    await db
      .update(user)
      .set({ emailVerified: new Date() })
      .where(eq(user.id, existingUser.id));


    console.log("deleting the verificationtoken")
    await db.delete(verificationToken).where(eq(verificationToken.id, foundVerificationToken.id));


    console.log("User verified");

    return { status: "success" };
  } catch (error) {
    console.log("An error occured trying to verify user", error);
    return { status: "failed" };
  }
};

