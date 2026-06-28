import User from '../models/User.js';
import Friendship from '../models/Friendship.js';
import Notification from '../models/Notification.js';
import Habit from '../models/Habit.js';
import Reflection from '../models/Reflection.js';
import Gratitude from '../models/Gratitude.js';
import FocusSession from '../models/FocusSession.js';
import Achievement from '../models/Achievement.js';
import Goal from '../models/Goal.js';
import { ACHIEVEMENT_DEFINITIONS } from '../utils/achievementEngine.js';
import { io } from '../socket/socketHandler.js';

/**
 * @desc    Search users by username or name
 * @route   GET /api/friends/search?query=...
 * @access  Private
 */
export const searchUsers = async (req, res, next) => {
  try {
    const queryStr = req.query.query ? String(req.query.query).trim() : '';
    if (!queryStr) {
      return res.status(200).json([]);
    }

    // Find up to 10 users whose name or username contains query (case-insensitive),
    // excluding the currently logged-in user.
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { name: { $regex: queryStr, $options: 'i' } },
        { username: { $regex: queryStr, $options: 'i' } }
      ]
    })
      .select('_id name username avatar')
      .limit(10);

    const userIds = users.map(u => u._id);

    // Fetch existing friendships between logged-in user and the matched users
    const friendships = await Friendship.find({
      $or: [
        { requester: req.user._id, recipient: { $in: userIds } },
        { requester: { $in: userIds }, recipient: req.user._id }
      ]
    });

    // Map each user to include friendshipStatus
    const results = users.map(user => {
      const friendship = friendships.find(f =>
        (f.requester.toString() === req.user._id.toString() && f.recipient.toString() === user._id.toString()) ||
        (f.requester.toString() === user._id.toString() && f.recipient.toString() === req.user._id.toString())
      );

      let friendshipStatus = 'not_friends';
      if (friendship) {
        if (friendship.status === 'accepted') {
          friendshipStatus = 'accepted';
        } else if (friendship.status === 'pending') {
          if (friendship.requester.toString() === req.user._id.toString()) {
            friendshipStatus = 'pending_sent';
          } else {
            friendshipStatus = 'pending_received';
          }
        }
      }

      return {
        _id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        friendshipStatus
      };
    });

    return res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send a friend request to another user
 * @route   POST /api/friends/request
 * @access  Private
 */
export const sendFriendRequest = async (req, res, next) => {
  try {
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    // Check not sending request to yourself
    if (recipientId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Check recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check friendship does not already exist
    const existing = await Friendship.findOne({
      $or: [
        { requester: req.user._id, recipient: recipientId },
        { requester: recipientId, recipient: req.user._id }
      ]
    });

    if (existing) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Create new Friendship with status pending
    const friendship = await Friendship.create({
      requester: req.user._id,
      recipient: recipientId,
      status: 'pending',
      requestedAt: new Date()
    });

    // Create notification for recipient
    await Notification.create({
      user: recipientId,
      title: 'Friend Request',
      message: `${req.user.name} sent you a friend request!`,
      type: 'friend_request',
      icon: '👥',
      link: `/dashboard/friends?friendshipId=${friendship._id}`
    });

    if (io) {
      io.to(recipientId.toString()).emit('friend_request_received', {
        type: 'friend_request',
        message: `${req.user.name} sent you a friend request!`,
        from: {
          _id: req.user._id,
          name: req.user.name,
          username: req.user.username,
          avatar: req.user.avatar
        },
        friendshipId: friendship._id
      });
    }

    return res.status(201).json(friendship);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept or reject a friend request
 * @route   PATCH /api/friends/respond
 * @access  Private
 */
export const respondToRequest = async (req, res, next) => {
  try {
    const { friendshipId, action } = req.body;

    if (!friendshipId || !['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid payload. Action must be accept or reject' });
    }

    // Find friendship where recipient matches logged-in user
    const friendship = await Friendship.findOne({
      _id: friendshipId,
      recipient: req.user._id
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Friendship request not found or unauthorized' });
    }

    if (action === 'accept') {
      friendship.status = 'accepted';
      friendship.respondedAt = new Date();
      await friendship.save();

      // Create notification for requester
      await Notification.create({
        user: friendship.requester,
        title: 'Friend Request Accepted',
        message: `${req.user.name} accepted your friend request!`,
        type: 'friend_accepted',
        icon: '🤝'
      });

      if (io) {
        io.to(friendship.requester.toString()).emit('friend_request_accepted', {
          type: 'friend_accepted',
          message: `${req.user.name} accepted your friend request!`,
          from: {
            _id: req.user._id,
            name: req.user.name,
            username: req.user.username,
            avatar: req.user.avatar
          }
        });
      }
    } else if (action === 'reject') {
      friendship.status = 'rejected';
      friendship.respondedAt = new Date();
      await friendship.save();
    }

    return res.status(200).json(friendship);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all accepted friends
 * @route   GET /api/friends
 * @access  Private
 */
export const getFriends = async (req, res, next) => {
  try {
    const friendships = await Friendship.find({
      status: 'accepted',
      $or: [
        { requester: req.user._id },
        { recipient: req.user._id }
      ]
    })
      .populate('requester', '_id name username avatar')
      .populate('recipient', '_id name username avatar');

    const friends = friendships.map(f => {
      const otherUser = f.requester._id.toString() === req.user._id.toString() ? f.recipient : f.requester;
      if (!otherUser) return null;
      
      const friendObj = otherUser.toObject ? otherUser.toObject() : JSON.parse(JSON.stringify(otherUser));
      friendObj.friendshipId = f._id;
      return friendObj;
    }).filter(Boolean);

    return res.status(200).json(friends);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all pending friend requests (received)
 * @route   GET /api/friends/pending
 * @access  Private
 */
export const getPendingRequests = async (req, res, next) => {
  try {
    const pendingRequests = await Friendship.find({
      recipient: req.user._id,
      status: 'pending'
    })
      .populate('requester', '_id name username avatar');

    return res.status(200).json(pendingRequests);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all sent friend requests
 * @route   GET /api/friends/sent
 * @access  Private
 */
export const getSentRequests = async (req, res, next) => {
  try {
    const sentRequests = await Friendship.find({
      requester: req.user._id,
      status: 'pending'
    })
      .populate('recipient', '_id name username avatar');

    return res.status(200).json(sentRequests);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a friend
 * @route   DELETE /api/friends/:friendshipId
 * @access  Private
 */
export const removeFriend = async (req, res, next) => {
  try {
    const { friendshipId } = req.params;

    const friendship = await Friendship.findOne({
      _id: friendshipId,
      status: { $in: ['accepted', 'pending'] },
      $or: [
        { requester: req.user._id },
        { recipient: req.user._id }
      ]
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found or unauthorized' });
    }

    // Hard delete the friendship
    await Friendship.deleteOne({ _id: friendship._id });

    return res.status(200).json({ message: 'Friend removed' });
  } catch (error) {
    next(error);
  }
};

// ─── Streak Calculation Helper ──────────────────────────────────────────────────

/**
 * Calculates current and longest consecutive daily streaks from a list of dates.
 * @param {Date[]} datesList
 * @returns {{ current: number, longest: number }}
 */
const calculateStreak = (datesList) => {
  if (!datesList || datesList.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Normalize dates to midnight local time and extract unique timestamps
  const sortedTimestamps = Array.from(
    new Set(
      datesList.map((d) => {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    )
  ).sort((a, b) => a - b); // Ascending order

  // 1. Calculate longest streak ever
  let longest = 0;
  let currentSegment = 0;
  let prevTime = null;

  for (const time of sortedTimestamps) {
    if (prevTime === null) {
      currentSegment = 1;
    } else {
      const d1 = new Date(prevTime);
      const d2 = new Date(time);

      const d1PlusOne = new Date(d1);
      d1PlusOne.setDate(d1PlusOne.getDate() + 1);

      if (
        d1PlusOne.getFullYear() === d2.getFullYear() &&
        d1PlusOne.getMonth() === d2.getMonth() &&
        d1PlusOne.getDate() === d2.getDate()
      ) {
        currentSegment++;
      } else {
        if (currentSegment > longest) longest = currentSegment;
        currentSegment = 1;
      }
    }
    prevTime = time;
  }
  if (currentSegment > longest) longest = currentSegment;

  // 2. Calculate current streak ending today or yesterday
  const uniqueDescending = [...sortedTimestamps].sort((a, b) => b - a);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const yesterdayTime = yesterday.getTime();

  const includesDate = (dateObj) => {
    return uniqueDescending.some((t) => {
      const d = new Date(t);
      return (
        d.getFullYear() === dateObj.getFullYear() &&
        d.getMonth() === dateObj.getMonth() &&
        d.getDate() === dateObj.getDate()
      );
    });
  };

  let currentCheckTime = null;
  if (includesDate(today)) {
    currentCheckTime = todayTime;
  } else if (includesDate(yesterday)) {
    currentCheckTime = yesterdayTime;
  } else {
    return { current: 0, longest };
  }

  let current = 0;
  const checkDate = new Date(currentCheckTime);
  while (includesDate(checkDate)) {
    current++;
    checkDate.setDate(checkDate.getDate() - 1);
    checkDate.setHours(0, 0, 0, 0); // re-normalize
  }

  return { current, longest };
};

// ─── New Friend Profile Handlers ────────────────────────────────────────────────

/**
 * @desc    Get public profile of a friend
 * @route   GET /api/friends/:userId/profile
 * @access  Private
 */
export const getFriendProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Verify friendship exists and is accepted
    const friendship = await Friendship.findOne({
      status: 'accepted',
      $or: [
        { requester: req.user._id, recipient: userId },
        { requester: userId, recipient: req.user._id }
      ]
    });

    if (!friendship) {
      return res.status(403).json({ message: 'You must be friends to view this profile' });
    }

    // Fetch friend's user data
    const friend = await User.findById(userId).select('_id name username avatar createdAt');
    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Days since joined
    const diffTime = Math.abs(new Date() - new Date(friend.createdAt));
    const joinedDaysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Fetch active habits
    const habits = await Habit.find({ user: userId, isActive: true });
    const activeHabitsList = habits.map(h => ({
      name: h.name,
      icon: h.icon,
      currentStreak: h.streak || 0,
      longestStreak: h.longestStreak || 0
    }));

    // Fetch reflections
    const reflections = await Reflection.find({ user: userId, isActive: true });
    const reflectionDates = reflections.map(r => r.date);
    const reflectionStreaks = calculateStreak(reflectionDates);

    // Fetch gratitudes
    const gratitudes = await Gratitude.find({ user: userId, isActive: true });
    const gratitudeDates = gratitudes.map(g => g.date);
    const gratitudeStreaks = calculateStreak(gratitudeDates);

    // Fetch focus sessions
    const focusSessions = await FocusSession.find({ user: userId, isCompleted: true, type: 'focus' });
    const focusDates = focusSessions.map(f => f.completedAt);
    const focusStreaks = calculateStreak(focusDates);
    const totalMinutes = focusSessions.reduce((acc, session) => acc + (session.duration || 0), 0);

    // Fetch achievements
    const achievements = await Achievement.find({ user: userId });
    const totalUnlocked = achievements.length;
    const totalPossible = ACHIEVEMENT_DEFINITIONS.length;

    return res.status(200).json({
      friendshipId: friendship._id,
      profile: {
        _id: friend._id,
        name: friend.name,
        username: friend.username,
        avatar: friend.avatar,
        createdAt: friend.createdAt
      },
      streaks: {
        habits: activeHabitsList,
        reflection: {
          currentStreak: reflectionStreaks.current,
          longestStreak: reflectionStreaks.longest
        },
        gratitude: {
          currentStreak: gratitudeStreaks.current,
          longestStreak: gratitudeStreaks.longest
        },
        focus: {
          currentStreak: focusStreaks.current,
          longestStreak: focusStreaks.longest,
          totalMinutes
        }
      },
      achievements: achievements.map(a => ({
        key: a.key,
        title: a.title,
        description: a.description,
        icon: a.icon,
        category: a.category,
        unlockedAt: a.unlockedAt
      })),
      totalUnlocked,
      totalPossible,
      joinedDaysAgo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get streak comparison between two users
 * @route   GET /api/friends/:userId/compare
 * @access  Private
 */
export const getStreakComparison = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    // Verify friendship exists and is accepted
    const friendship = await Friendship.findOne({
      status: 'accepted',
      $or: [
        { requester: myId, recipient: userId },
        { requester: userId, recipient: myId }
      ]
    });

    if (!friendship) {
      return res.status(403).json({ message: 'You must be friends to view comparison' });
    }

    const getWinner = (myVal, theirVal) => {
      if (myVal > theirVal) return 'me';
      if (theirVal > myVal) return 'them';
      return 'tie';
    };

    // 1. Habits (best active habit streak)
    const myHabits = await Habit.find({ user: myId, isActive: true });
    const theirHabits = await Habit.find({ user: userId, isActive: true });
    const myBestHabitStreak = myHabits.length > 0 ? Math.max(...myHabits.map(h => h.streak || 0)) : 0;
    const theirBestHabitStreak = theirHabits.length > 0 ? Math.max(...theirHabits.map(h => h.streak || 0)) : 0;

    // 2. Focus minutes
    const myFocusSessions = await FocusSession.find({ user: myId, isCompleted: true, type: 'focus' });
    const theirFocusSessions = await FocusSession.find({ user: userId, isCompleted: true, type: 'focus' });
    const myTotalFocusMinutes = myFocusSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const theirTotalFocusMinutes = theirFocusSessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    // 3. Reflection streak (current)
    const myReflections = await Reflection.find({ user: myId, isActive: true });
    const theirReflections = await Reflection.find({ user: userId, isActive: true });
    const myReflectionStreak = calculateStreak(myReflections.map(r => r.date)).current;
    const theirReflectionStreak = calculateStreak(theirReflections.map(r => r.date)).current;

    // 4. Gratitude streak (current)
    const myGratitudes = await Gratitude.find({ user: myId, isActive: true });
    const theirGratitudes = await Gratitude.find({ user: userId, isActive: true });
    const myGratitudeStreak = calculateStreak(myGratitudes.map(g => g.date)).current;
    const theirGratitudeStreak = calculateStreak(theirGratitudes.map(g => g.date)).current;

    // 5. Achievements
    const myAchievementsCount = await Achievement.countDocuments({ user: myId });
    const theirAchievementsCount = await Achievement.countDocuments({ user: userId });

    const habitsWinner = getWinner(myBestHabitStreak, theirBestHabitStreak);
    const focusWinner = getWinner(myTotalFocusMinutes, theirTotalFocusMinutes);
    const reflectionWinner = getWinner(myReflectionStreak, theirReflectionStreak);
    const gratitudeWinner = getWinner(myGratitudeStreak, theirGratitudeStreak);
    const achievementsWinner = getWinner(myAchievementsCount, theirAchievementsCount);

    const categories = [habitsWinner, focusWinner, reflectionWinner, gratitudeWinner, achievementsWinner];
    const myWins = categories.filter(w => w === 'me').length;
    const theirWins = categories.filter(w => w === 'them').length;
    let overallWinner = 'tie';
    if (myWins > theirWins) {
      overallWinner = 'me';
    } else if (theirWins > myWins) {
      overallWinner = 'them';
    }

    return res.status(200).json({
      habits: {
        myBestStreak: myBestHabitStreak,
        theirBestStreak: theirBestHabitStreak,
        winner: habitsWinner
      },
      focus: {
        myTotalMinutes: myTotalFocusMinutes,
        theirTotalMinutes: theirTotalFocusMinutes,
        winner: focusWinner
      },
      reflection: {
        myStreak: myReflectionStreak,
        theirStreak: theirReflectionStreak,
        winner: reflectionWinner
      },
      gratitude: {
        myStreak: myGratitudeStreak,
        theirStreak: theirGratitudeStreak,
        winner: gratitudeWinner
      },
      achievements: {
        myCount: myAchievementsCount,
        theirCount: theirAchievementsCount,
        winner: achievementsWinner
      },
      overallWinner
    });
  } catch (error) {
    next(error);
  }
};
