-- Create table for storing TradingView chart layouts per user
create table chart_layouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  layout_name text not null default 'default',
  chart_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure one default layout per user
  unique(user_id, layout_name)
);

-- Enable RLS (Row Level Security)
alter table chart_layouts enable row level security;

-- Create policies
create policy "Users can view their own chart layouts" on chart_layouts
  for select using (auth.uid() = user_id);

create policy "Users can insert their own chart layouts" on chart_layouts
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own chart layouts" on chart_layouts
  for update using (auth.uid() = user_id);

create policy "Users can delete their own chart layouts" on chart_layouts
  for delete using (auth.uid() = user_id);

-- Create updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_chart_layouts_updated_at
  before update on chart_layouts
  for each row
  execute function update_updated_at_column();
