'use server';

import { ID, InputFile, Query } from 'node-appwrite';

import {
  BUCKET_ID,
  DATABASE_ID,
  ENDPOINT,
  PATIENT_COLLECTION_ID,
  PROJECT_ID,
  databases,
  account,
  storage,
  users,
} from '../appwrite.config';
import { parseStringify } from '../utils';

// LOGIN APPWRITE
export const login = async (userData: LoginParams) => {
  try {
    const existingUsers = await users.list([
      Query.equal('email', userData.email),
    ]);

    let user;
    if (existingUsers.total > 0) {
      // User  exists
      //log in

      try {
        const session = await account.createEmailPasswordSession(
          userData.email,
          userData.password
        );
        console.log('session');
        console.log(session);
        if (session) {
          // User successfully logged in
          // user = existingUsers.users[0];
          user = session.userId;

          return user;
        } else {
          return null;
        }
      } catch (error: any) {
        if (error.code === 401) {
          // Wrong password error
          throw new Error('incorrect password.');
        }
        throw error; // Rethrow other unexpected errors
      }
    }

    return parseStringify(user);
  } catch (error: any) {
    console.error('An error occurred while login in:', error);
  }
};
// CREATE APPWRITE USER
export const createUser = async (user: CreateUserParams) => {
  try {
    // Create new user -> https://appwrite.io/docs/references/1.5.x/server-nodejs/users#create
    const newuser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      user.password,
      user.name
    );

    return parseStringify(newuser);
  } catch (error: any) {
    // Check existing user
    if (error && error?.code === 409) {
      const existingUser = await users.list([
        Query.equal('email', [user.email]),
      ]);

      return existingUser.users[0];
    }
    console.error('An error occurred while creating a new user:', error);
  }
};

// GET USER
export const getUser = async (userId: string) => {
  try {
    const user = await users.get(userId);
    return parseStringify(user);
  } catch (error) {
    console.error(
      'An error occurred while retrieving the user details:',
      error
    );
  }
};
