/**
 * Web Integration Example (Next.js)
 * 
 * NOTE: This file contains example code as comments.
 * For actual implementation with JSX, convert to .tsx or create a separate implementation file.
 */

// Type definitions for reference
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Example JSX code - Convert this file to .tsx for actual JSX usage:
 * 
 * import React from 'react';
 * import { SharedAdminDashboard } from '@pawfectmatch/admin';
 * import { useAdminAuth } from '@pawfectmatch/admin';
 * 
 * const AdminPage: React.FC = () => {
 *   const { isAuthenticated } = useAdminAuth();
 * 
 *   if (!isAuthenticated) {
 *     // Next.js redirect logic
 *     return null;
 *   }
 * 
 *   return (
 *     <div className="min-h-screen bg-gray-50">
 *       <SharedAdminDashboard />
 *     </div>
 *   );
 * };
 * 
 * // API Route for admin data (Next.js)
 * import { getAdminAPI } from '@pawfectmatch/admin';
 * 
 * export default async function handler(req: NextApiRequest, res: NextApiResponse) {
 *   if (req.method !== 'GET') {
 *     return res.status(405).json({ message: 'Method not allowed' });
 *   }
 * 
 *   try {
 *     const api = getAdminAPI();
 *     const data = await api.getDashboardData();
 *     res.status(200).json(data);
 *   } catch (error) {
 *     res.status(500).json({ message: 'Internal server error' });
 *   }
 * }
 */
