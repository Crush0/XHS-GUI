interface User {
    userId?: string | null;
    unqiueId?: string | null;
    userName?: string | null;
    userIP?: string | null;
    userDesc?: string | null;
    userAvatar?: string | null;
    userTags?: string[] | null;
    userInteractions?: UserInteractions | null;
}

interface UserInteractions {
    follower?: string | null;
    fans?: string | null;
    likes?: string | null;
}