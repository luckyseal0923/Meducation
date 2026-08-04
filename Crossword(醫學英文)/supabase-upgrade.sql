alter table public.questions add column if not exists category text;

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  unique(owner_id, name)
);

alter table public.tags enable row level security;

drop policy if exists "owners manage tags" on public.tags;
create policy "owners manage tags"
on public.tags for all to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "public reads questions in published quizzes" on public.questions;
create policy "public reads questions in published quizzes"
on public.questions for select
using (
  exists (
    select 1
    from public.quiz_questions qq
    join public.quizzes q on q.id = qq.quiz_id
    where qq.question_id = questions.id
      and q.is_published = true
  )
);

create table if not exists public.shared_questions (
  id uuid primary key default gen_random_uuid(),
  term text not null unique,
  clue text not null,
  category text,
  created_at timestamptz default now()
);

alter table public.shared_questions enable row level security;

drop policy if exists "public reads shared questions" on public.shared_questions;
create policy "public reads shared questions"
on public.shared_questions for select
using (true);

insert into public.shared_questions (term, clue, category) values
('HYPOKALEMIA','低血鉀','Clinical'),
('HYPERKALEMIA','高血鉀','Clinical'),
('HYPONATREMIA','低血鈉','Clinical'),
('HYPERNATREMIA','高血鈉','Clinical'),
('HYPOCALCEMIA','低血鈣','Clinical'),
('HYPERCALCEMIA','高血鈣','Clinical'),
('HYPOGLYCEMIA','低血糖','Clinical'),
('HYPERGLYCEMIA','高血糖','Clinical'),
('ACIDOSIS','酸中毒','Clinical'),
('ALKALOSIS','鹼中毒','Clinical'),
('ANEMIA','貧血','Clinical'),
('LEUKEMIA','白血病','Clinical'),
('PANCYTOPENIA','全血球減少','Clinical'),
('LEUKOPENIA','白血球減少','Clinical'),
('NEUTROPENIA','嗜中性球減少','Clinical'),
('HYPERTENSION','高血壓','Clinical'),
('HYPOTENSION','低血壓','Clinical'),
('ARRHYTHMIA','心律不整','Clinical'),
('ANGINA','心絞痛','Clinical'),
('INFARCTION','心肌梗塞','Clinical'),
('CARDIOMYOPATHY','心肌病','Clinical'),
('MYOCARDITIS','心肌炎','Clinical'),
('PERICARDITIS','心包膜炎','Clinical'),
('ENDOCARDITIS','心內膜炎','Clinical'),
('ANEURYSM','動脈瘤','Clinical'),
('THROMBOSIS','血栓','Clinical'),
('EMBOLISM','栓塞','Clinical'),
('ATHEROSCLEROSIS','動脈硬化','Clinical'),
('TACHYCARDIA','心搏過速','Clinical'),
('BRADYCARDIA','心搏過緩','Clinical'),
('PNEUMONIA','肺炎','Clinical'),
('ASTHMA','氣喘','Clinical'),
('EMPHYSEMA','肺氣腫','Clinical'),
('PNEUMOTHORAX','氣胸','Clinical'),
('PLEURISY','胸膜炎','Clinical'),
('BRONCHITIS','支氣管炎','Clinical'),
('TUBERCULOSIS','肺結核','Clinical'),
('ATELECTASIS','肺不張','Clinical'),
('BRONCHIECTASIS','支氣管擴張','Clinical'),
('DYSPNEA','呼吸困難','Clinical'),
('HEMOPTYSIS','咳血','Clinical'),
('CYANOSIS','發紺','Clinical'),
('WHEEZING','喘鳴','Clinical'),
('HYPOXEMIA','低血氧','Clinical'),
('HYPOXIA','缺氧','Clinical'),
('GASTRITIS','胃炎','Clinical'),
('GASTROENTERITIS','腸胃炎','Clinical'),
('APPENDICITIS','闌尾炎','Clinical'),
('PANCREATITIS','胰臟炎','Clinical'),
('HEPATITIS','肝炎','Clinical'),
('CIRRHOSIS','肝硬化','Clinical'),
('PERITONITIS','腹膜炎','Clinical'),
('CHOLECYSTITIS','膽囊炎','Clinical'),
('CHOLANGITIS','膽管炎','Clinical'),
('JAUNDICE','黃疸','Clinical'),
('ASCITES','腹水','Clinical'),
('DIARRHEA','腹瀉','Clinical'),
('CONSTIPATION','便祕','Clinical'),
('NAUSEA','噁心','Clinical'),
('VOMITING','嘔吐','Clinical'),
('NEPHRITIS','腎炎','Clinical'),
('UREMIA','尿毒症','Clinical'),
('CYSTITIS','膀胱炎','Clinical'),
('URETHRITIS','尿道炎','Clinical'),
('HEMATURIA','血尿','Clinical'),
('PROTEINURIA','蛋白尿','Clinical'),
('OLIGURIA','少尿','Clinical'),
('ANURIA','無尿','Clinical'),
('FREQUENCY','頻尿','Clinical'),
('DYSURIA','排尿疼痛','Clinical'),
('DIABETES','糖尿病','Clinical'),
('HYPERTHYROIDISM','甲狀腺亢進','Clinical'),
('HYPOTHYROIDISM','甲狀腺低下','Clinical'),
('THYROIDITIS','甲狀腺炎','Clinical'),
('OBESITY','肥胖','Clinical'),
('SEPSIS','敗血症','Clinical'),
('MENINGITIS','腦膜炎','Clinical'),
('ENCEPHALITIS','腦炎','Clinical'),
('CELLULITIS','蜂窩性組織炎','Clinical'),
('OSTEOMYELITIS','骨髓炎','Clinical'),
('EPILEPSY','癲癇','Clinical'),
('STROKE','中風','Clinical'),
('APHASIA','失語症','Clinical'),
('ATAXIA','共濟失調','Clinical'),
('DELIRIUM','譫妄','Clinical'),
('DEMENTIA','失智症','Clinical'),
('MIGRAINE','偏頭痛','Clinical'),
('SYNCOPE','暈厥','Clinical'),
('VERTIGO','眩暈','Clinical'),
('PARALYSIS','癱瘓','Clinical'),
('FRACTURE','骨折','Clinical'),
('ARTHRITIS','關節炎','Clinical'),
('OSTEOPOROSIS','骨質疏鬆','Clinical'),
('GOUT','痛風','Clinical'),
('BURN','燒傷','Clinical'),
('SHOCK','休克','Clinical'),
('ALLERGY','過敏反應','Clinical'),
('ANAPHYLAXIS','全身性過敏反應','Clinical'),
('MALIGNANCY','惡性腫瘤','Clinical'),
('METASTASIS','轉移','Clinical')
on conflict (term) do update set
  clue = excluded.clue,
  category = excluded.category;
