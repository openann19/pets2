-- PawReels Seed Data
-- Run after migrations/001_init.sql

-- 1. Test User
insert into "User"(handle, locale, refCode) values ('dev_user', 'en', 'DEV001') returning id as user_id;

-- 2. Sample Tracks (with placeholder waveform data)
insert into "Track"(title, artist, bpm, duration_ms, license_id, license_expiry, url, genre, mood) values
  ('Upbeat Pop', 'PawfectSounds', 128, 120000, 'LICENSE_001', now() + interval '1 year', 's3://reels/tracks/track1.mp3', 'pop', 'happy'),
  ('Chill Vibes', 'PetBeats', 92, 180000, 'LICENSE_002', now() + interval '1 year', 's3://reels/tracks/track2.mp3', 'electronic', 'chill'),
  ('Energetic Rock', 'DogsOnStage', 140, 95000, 'LICENSE_003', now() + interval '1 year', 's3://reels/tracks/track3.mp3', 'rock', 'energetic')
returning id as track1_id, track2_id, track3_id;

-- 3. Templates (the 3 JSONs from server/templates/)
insert into "Template"(name, json_spec, min_clips, max_clips, theme, is_active, version) values
  (
    'Upbeat • Punchy Cuts',
    '{"canvas":{"w":1080,"h":1920,"fps":30,"bg":"#000000"},"music":{"bpm":128,"offsetMs":300},"timeline":[{"t":0,"clip":0,"inMs":0,"durMs":900,"transOut":"dip"},{"t":900,"clip":1,"inMs":0,"durMs":800,"transOut":"cut"},{"t":1700,"clip":2,"inMs":0,"durMs":900,"transOut":"slideUp"},{"t":2600,"clip":3,"inMs":0,"durMs":900,"transOut":"dip"},{"t":3500,"clip":4,"inMs":0,"durMs":1000,"transOut":"cut"}],"fx":[{"t":400,"type":"zoomPunch","amount":0.08,"duration":220},{"t":1300,"type":"zoomPunch","amount":0.06,"duration":200},{"t":2100,"type":"furEnhance","strength":0.6},{"t":3200,"type":"eyeSparkle","strength":0.7}],"overlays":[{"t":0,"durMs":1200,"type":"text","key":"reels.title_upbeat","style":"titleLg","pos":["50%","12%"]},{"t":1800,"durMs":600,"type":"sticker","name":"paw","pos":["90%","86%"],"scale":0.9}],"cta":{"variant":"adopt","t":-1000},"styles":{"titleLg":{"font":"Inter-Bold.ttf","size":64,"color":"#FFFFFF","align":"center","shadow":"000000CC:2:2"},"caption":{"font":"Inter-Medium.ttf","size":36,"color":"#FFFFFF","align":"center","bg":"#00000080","pad":16}}}'::jsonb,
    5,
    12,
    'pets',
    true,
    1
  ),
  (
    'Heartfelt • Smooth Moments',
    '{"canvas":{"w":1080,"h":1920,"fps":30,"bg":"#000000"},"music":{"bpm":92,"offsetMs":450},"timeline":[{"t":0,"clip":0,"inMs":0,"durMs":1400,"transOut":"fade"},{"t":1400,"clip":1,"inMs":0,"durMs":1400,"transOut":"fade"},{"t":2800,"clip":2,"inMs":0,"durMs":1500,"transOut":"slideLeft"},{"t":4300,"clip":3,"inMs":0,"durMs":1600,"transOut":"fade"}],"fx":[{"t":1200,"type":"vignette","strength":0.25},{"t":2000,"type":"softLUT","name":"pastel"}],"overlays":[{"t":300,"durMs":2200,"type":"text","key":"reels.title_heartfelt","style":"lowerThird","pos":["50%","86%"]}],"cta":{"variant":"follow","t":-1200},"styles":{"lowerThird":{"font":"Inter-SemiBold.ttf","size":40,"color":"#FFFFFF","align":"center","bg":"#00000066","pad":20,"radius":24}}}'::jsonb,
    4,
    10,
    'pets',
    true,
    1
  ),
  (
    'Funny • Quick Cuts + Emojis',
    '{"canvas":{"w":1080,"h":1920,"fps":30,"bg":"#000000"},"music":{"bpm":140,"offsetMs":250},"timeline":[{"t":0,"clip":0,"inMs":0,"durMs":700,"transOut":"cut"},{"t":700,"clip":1,"inMs":0,"durMs":650,"transOut":"slideUp"},{"t":1350,"clip":2,"inMs":0,"durMs":700,"transOut":"dip"},{"t":2050,"clip":3,"inMs":0,"durMs":650,"transOut":"cut"},{"t":2700,"clip":4,"inMs":0,"durMs":700,"transOut":"slideRight"},{"t":3400,"clip":5,"inMs":0,"durMs":700,"transOut":"cut"}],"fx":[{"t":600,"type":"jumboSticker","name":"lol","pos":["20%","15%"],"scale":1.2,"duration":400},{"t":1900,"type":"shake","amplitude":6,"duration":260},{"t":3000,"type":"zoomPunch","amount":0.09,"duration":180}],"overlays":[{"t":1000,"durMs":800,"type":"text","key":"reels.caption_funny1","style":"comic","pos":["50%","14%"]},{"t":2600,"durMs":800,"type":"text","key":"reels.caption_funny2","style":"comic","pos":["52%","84%"]}],"cta":{"variant":"challenge","t":-900},"styles":{"comic":{"font":"Inter-Black.ttf","size":56,"color":"#FFFFFF","stroke":"#000000","strokeW":6,"align":"center"}}}'::jsonb,
    6,
    16,
    'pets',
    true,
    1
  )
returning id;

-- Done!
select 'Seed complete: 1 user, 3 tracks, 3 templates' as status;

