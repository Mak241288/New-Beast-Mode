import { Response } from 'express';
import prisma from '../services/db';
import { AuthRequest } from '../middleware/auth';
import { chatConsultationAI } from '../services/aiService';

// @desc    Get Chat History
// @route   GET /api/chat/history
export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  try {
    if (!userId) {
      res.status(401).json({ error: 'غير مصرح' });
      return;
    }

    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { timestamp: 'asc' },
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'فشل جلب تاريخ المحادثة' });
  }
};

// @desc    Send Message & Get AI reply (sakhr 66 yrs coach/doctor)
// @route   POST /api/chat/message
export const sendChatMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { text } = req.body;

  try {
    if (!userId || !text) {
      res.status(400).json({ error: 'الرجاء إدخال نص الرسالة' });
      return;
    }

    // 1. Fetch chat history for context (limit to last 15 messages for tokens)
    const history = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 15,
    });

    // reverse to chronological order
    const formattedHistory = history.reverse().map(msg => ({
      sender: msg.sender,
      text: msg.text,
    }));

    // 2. Call AI Consultation
    const replyText = await chatConsultationAI(userId, formattedHistory, text);

    // 3. Save User Message and AI Message in DB in transaction
    const savedMessages = await prisma.$transaction([
      prisma.chatMessage.create({
        data: {
          userId,
          sender: 'USER',
          text,
        },
      }),
      prisma.chatMessage.create({
        data: {
          userId,
          sender: 'AI',
          text: replyText,
        },
      }),
    ]);

    // Return the AI reply message (second in array)
    res.status(201).json(savedMessages[1]);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'فشل الاتصال بالمستشار الرياضي' });
  }
};
