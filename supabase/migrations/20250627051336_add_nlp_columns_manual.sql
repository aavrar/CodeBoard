ALTER TABLE "public"."examples" ADD COLUMN "tokens" JSONB[] DEFAULT ARRAY[]::JSONB[];
ALTER TABLE "public"."examples" ADD COLUMN "switch_points" INTEGER[] DEFAULT ARRAY[]::INTEGER[];