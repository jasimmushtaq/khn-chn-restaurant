-- Create tables for order-scoped chat

-- Chat rooms table
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE,
    customer_id UUID NOT NULL,
    partner_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'closed', 'expired')) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Assuming these tables exist in the public schema or auth schema
    -- If they don't, we can still define the FKs or omit them if strictness isn't required for this migration
    CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES auth.users(id),
    CONSTRAINT fk_partner FOREIGN KEY (partner_id) REFERENCES auth.users(id) -- Assuming partners are also in auth.users
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_role VARCHAR(10) NOT NULL CHECK (sender_role IN ('customer', 'partner')),
    body TEXT NOT NULL CHECK (length(body) <= 500),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    flagged BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms
-- Users can see rooms they belong to
CREATE POLICY "Users can view their own chat rooms" 
ON public.chat_rooms 
FOR SELECT 
USING (auth.uid() = customer_id OR auth.uid() = partner_id);

-- RLS Policies for chat_messages
-- Users can read messages for a room where they are the customer or partner
CREATE POLICY "Users can view messages in their rooms" 
ON public.chat_messages 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.chat_rooms 
        WHERE id = public.chat_messages.room_id 
        AND (customer_id = auth.uid() OR partner_id = auth.uid())
    )
);

-- Users can only insert messages into an active room they belong to
CREATE POLICY "Users can insert messages into their active rooms" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.chat_rooms 
        WHERE id = public.chat_messages.room_id 
        AND status = 'active'
        AND (customer_id = auth.uid() OR partner_id = auth.uid())
    )
);

-- No user can update or delete messages (already default if not explicitly allowed, but let's be safe)
-- We just don't create UPDATE or DELETE policies.
