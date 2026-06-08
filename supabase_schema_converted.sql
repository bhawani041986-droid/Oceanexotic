CREATE TABLE "addons" (
  "id" VARCHAR(50) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "type" VARCHAR(100) DEFAULT 'Global Addon',
  "description" text DEFAULT NULL,
  "image_url" VARCHAR(512) DEFAULT NULL,
  "is_active" tinyINTEGER DEFAULT 1,
  "allowed_areas" text DEFAULT NULL,
  "start_time" time DEFAULT '00:00:00',
  "end_time" time DEFAULT '23:59:59',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);


CREATE TABLE "agent_settings" (
  "agent_id" INTEGER NOT NULL,
  "current_mood" VARCHAR(255) DEFAULT 'SENTINEL',
  "last_updated" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("agent_id")
);


CREATE TABLE "chat_conversations" (
  "id" SERIAL,
  "title" VARCHAR(255) DEFAULT NULL,
  "participant_1" VARCHAR(50) NOT NULL,
  "participant_2" VARCHAR(50) NOT NULL,
  "last_message_text" text DEFAULT NULL,
  "last_message_time" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
);


CREATE TABLE "chat_messages" (
  "id" SERIAL,
  "conversation_id" INTEGER NOT NULL,
  "sender_id" VARCHAR(50) NOT NULL,
  "message_text" text NOT NULL,
  "is_read" tinyINTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "chat_messages_ibfk_1" FOREIGN KEY ("conversation_id") REFERENCES "chat_conversations" ("id") ON DELETE CASCADE
);


CREATE TABLE "cms_content" (
  "id" SERIAL,
  "title" VARCHAR(255) NOT NULL,
  "type" VARCHAR(50) DEFAULT 'BANNER',
  "status" VARCHAR(50) DEFAULT 'DRAFT',
  "sector" VARCHAR(100) DEFAULT 'GLOBAL',
  "image_url" TEXT DEFAULT NULL,
  "metadata" TEXT DEFAULT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);


CREATE TABLE "delivery_agents" (
  "id" VARCHAR(50) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(50) DEFAULT NULL,
  "zone" VARCHAR(100) DEFAULT 'Port Blair',
  "status" VARCHAR(50) DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);


CREATE TABLE "fleet_logs" (
  "id" SERIAL,
  "order_id" VARCHAR(50) NOT NULL,
  "status" VARCHAR(255) NOT NULL,
  "location_name" VARCHAR(255) DEFAULT NULL,
  "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
);


CREATE TABLE "fleet_tracking" (
  "id" SERIAL,
  "order_id" VARCHAR(50) NOT NULL,
  "agent_id" VARCHAR(50) NOT NULL,
  "agent_name" VARCHAR(100) DEFAULT NULL,
  "current_lat" DECIMAL(10,8) NOT NULL,
  "current_lng" DECIMAL(11,8) NOT NULL,
  "current_temp" DECIMAL(4,1) DEFAULT -20.0,
  "estimated_arrival" VARCHAR(50) DEFAULT NULL,
  "status" VARCHAR(255) DEFAULT 'ASSIGNED',
  "last_updated" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE ("order_id")
);


CREATE TABLE "inventory_logs" (
  "id" bigSERIAL,
  "product_id" VARCHAR(50) NOT NULL,
  "catch_id" VARCHAR(50) DEFAULT NULL,
  "action" VARCHAR(50) NOT NULL,
  "quantity_change" DECIMAL(10,2) DEFAULT 0.00,
  "quantity_after" DECIMAL(10,2) DEFAULT 0.00,
  "actor_id" VARCHAR(50) DEFAULT NULL,
  "actor_type" VARCHAR(20) DEFAULT 'SYSTEM',
  "notes" text DEFAULT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
);


CREATE TABLE "maritime_territories" (
  "id" SERIAL,
  "name" VARCHAR(100) NOT NULL,
  "zone_type" VARCHAR(255) NOT NULL,
  "parent_id" INTEGER DEFAULT NULL,
  "coordinates" VARCHAR(100) DEFAULT NULL,
  "status" VARCHAR(255) DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
);


CREATE TABLE "marketplace_settings" (
  "id" SERIAL,
  "setting_key" VARCHAR(100) NOT NULL,
  "setting_value" TEXT NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE ("setting_key")
);


CREATE TABLE "order_items" (
  "id" SERIAL,
  "order_id" INTEGER NOT NULL,
  "product_id" VARCHAR(50) NOT NULL,
  "quantity" DECIMAL(10,2) NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "order_items_ibfk_1" FOREIGN KEY ("order_id") REFERENCES "orders" ("id")
);


CREATE TABLE "orders" (
  "id" SERIAL,
  "user_id" VARCHAR(50) NOT NULL,
  "total_amount" DECIMAL(10,2) NOT NULL,
  "status" VARCHAR(50) DEFAULT 'PENDING',
  "delivery_address" text DEFAULT NULL,
  "payment_method" VARCHAR(50) DEFAULT NULL,
  "delivery_agent_name" VARCHAR(255) DEFAULT NULL,
  "delivery_agent_phone" VARCHAR(50) DEFAULT NULL,
  "shipping_method" VARCHAR(100) DEFAULT 'STANDARD',
  "tracking_number" VARCHAR(100) DEFAULT NULL,
  "estimated_delivery" VARCHAR(100) DEFAULT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "delivery_area" VARCHAR(100) DEFAULT 'Port Blair',
  "is_pre_order" tinyINTEGER DEFAULT 0,
  PRIMARY KEY ("id"),
);


CREATE TABLE "product_cut_options" (
  "id" VARCHAR(50) NOT NULL,
  "product_id" VARCHAR(50) NOT NULL,
  "cut_type" VARCHAR(50) NOT NULL,
  "price_modifier_percent" DECIMAL(5,2) DEFAULT 0.00,
  "price_flat_add" DECIMAL(10,2) DEFAULT 0.00,
  "is_available" tinyINTEGER DEFAULT 1,
  "stock_kg" DECIMAL(10,2) DEFAULT NULL,
  "sort_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE ("product_id","cut_type")
);


CREATE TABLE "product_location_overrides" (
  "id" VARCHAR(50) NOT NULL,
  "product_id" VARCHAR(50) NOT NULL,
  "territory_name" VARCHAR(100) NOT NULL,
  "price" DECIMAL(10,2) DEFAULT NULL,
  "stock" DECIMAL(10,2) DEFAULT NULL,
  "is_visible" tinyINTEGER DEFAULT 1,
  "status" VARCHAR(30) DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE ("product_id","territory_name")
);


CREATE TABLE "product_prep_options" (
  "id" VARCHAR(50) NOT NULL,
  "product_id" VARCHAR(50) NOT NULL,
  "prep_type" VARCHAR(50) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "price_flat_add" DECIMAL(10,2) DEFAULT 0.00,
  "is_available" tinyINTEGER DEFAULT 1,
  "sort_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE ("product_id","name")
);


CREATE TABLE "products" (
  "id" VARCHAR(50) NOT NULL,
  "seller_id" VARCHAR(50) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "category" VARCHAR(100) NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "stock" DECIMAL(10,2) DEFAULT 0.00,
  "status" VARCHAR(50) DEFAULT 'ACTIVE',
  "image_url" TEXT DEFAULT NULL,
  "description" TEXT DEFAULT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "gallery" TEXT DEFAULT NULL,
  "unit" VARCHAR(50) DEFAULT 'KG',
  "is_live_inventory" tinyINTEGER DEFAULT 0,
  "harbor_node" VARCHAR(255) DEFAULT 'Phoenix Bay Harbor',
  "catch_date" date DEFAULT NULL,
  "nutrition" TEXT DEFAULT NULL,
  "quality_rank" VARCHAR(50) DEFAULT 'VERIFIED',
  PRIMARY KEY ("id"),
  CONSTRAINT "products_ibfk_1" FOREIGN KEY ("seller_id") REFERENCES "sellers" ("id")
);


CREATE TABLE "reviews" (
  "id" SERIAL,
  "product_id" VARCHAR(50) NOT NULL,
  "product_name" VARCHAR(255) DEFAULT NULL,
  "seller_id" VARCHAR(50) NOT NULL,
  "user_id" VARCHAR(50) NOT NULL,
  "user_name" VARCHAR(255) NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" text NOT NULL,
  "seller_response" text DEFAULT NULL,
  "responded_at" TIMESTAMP WITH TIME ZONE NULL,
  "evidence_gallery" TEXT DEFAULT NULL,
  "status" VARCHAR(255) DEFAULT 'PENDING',
  "order_id" INTEGER DEFAULT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
);


CREATE TABLE "seller_verification_docs" (
  "id" SERIAL,
  "seller_id" VARCHAR(50) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "doc_type" VARCHAR(255) NOT NULL,
  "file_path" VARCHAR(255) DEFAULT NULL,
  "status" VARCHAR(255) DEFAULT 'PENDING',
  "expiry_date" date DEFAULT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
);


CREATE TABLE "seller_withdrawals" (
  "id" SERIAL,
  "seller_id" VARCHAR(50) NOT NULL,
  "amount" DECIMAL(15,2) NOT NULL,
  "bank_node" VARCHAR(255) NOT NULL,
  "status" VARCHAR(255) DEFAULT 'PENDING',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
);


CREATE TABLE "sellers" (
  "id" VARCHAR(50) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "rating" DECIMAL(3,2) DEFAULT 5.00,
  "status" VARCHAR(50) DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE ("email")
);


CREATE TABLE "social_settings" (
  "id" SERIAL,
  "platform" VARCHAR(50) DEFAULT NULL,
  "webhook_url" text DEFAULT NULL,
  "is_active" tinyINTEGER DEFAULT 1,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE ("platform")
);


CREATE TABLE "subscribers" (
  "id" SERIAL,
  "email" VARCHAR(255) NOT NULL,
  "status" VARCHAR(50) DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE ("email")
);


CREATE TABLE "todays_catch" (
  "id" VARCHAR(50) NOT NULL,
  "product_id" VARCHAR(50) NOT NULL,
  "seller_id" VARCHAR(50) NOT NULL,
  "catch_date" date NOT NULL,
  "harbor_node" VARCHAR(100) NOT NULL DEFAULT 'Port Blair Harbor',
  "quantity_kg" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  "remaining_kg" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  "price_per_kg" DECIMAL(10,2) NOT NULL,
  "freshness_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
  "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "catch_image_url" text DEFAULT NULL,
  "batch_label" VARCHAR(50) DEFAULT 'TODAY',
  "status" VARCHAR(30) DEFAULT 'FRESH',
  "notes" text DEFAULT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
);


CREATE TABLE "user_addresses" (
  "id" SERIAL,
  "user_id" VARCHAR(50) NOT NULL,
  "label" VARCHAR(100) DEFAULT NULL,
  "hotel_name" VARCHAR(255) DEFAULT NULL,
  "room_no" VARCHAR(50) DEFAULT NULL,
  "jetty" VARCHAR(100) DEFAULT NULL,
  "address_line1" text NOT NULL,
  "phone" VARCHAR(20) DEFAULT NULL,
  "city" VARCHAR(100) DEFAULT 'Port Blair',
  "pincode" VARCHAR(20) DEFAULT NULL,
  "is_default" tinyINTEGER DEFAULT 0,
  PRIMARY KEY ("id")
);


CREATE TABLE "user_payments" (
  "id" SERIAL,
  "user_id" INTEGER NOT NULL,
  "type" VARCHAR(255) NOT NULL DEFAULT 'CARD',
  "card_type" VARCHAR(50) DEFAULT NULL,
  "card_holder" VARCHAR(100) DEFAULT NULL,
  "last4" VARCHAR(4) DEFAULT NULL,
  "expiry" VARCHAR(10) DEFAULT NULL,
  "upi_id" VARCHAR(100) DEFAULT NULL,
  "is_default" tinyINTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);


CREATE TABLE "users" (
  "id" VARCHAR(50) NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(100) NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "role" VARCHAR(255) DEFAULT NULL,
  "territory_id" INTEGER DEFAULT NULL,
  "status" VARCHAR(255) DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "avatar_url" VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY ("id"),
  UNIQUE ("email")
);


CREATE TABLE "verified_orders" (
  "id" SERIAL,
  "order_ref" VARCHAR(50) NOT NULL,
  "user_id" VARCHAR(50) NOT NULL,
  "product_id" VARCHAR(50) NOT NULL,
  "seller_id" VARCHAR(50) NOT NULL,
  "status" VARCHAR(20) DEFAULT 'DELIVERED',
  PRIMARY KEY ("id")
);

