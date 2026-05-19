import fs from 'fs';

const filePath = 'c:/Users/rauna/Desktop/hellointernugc/src/routes/dashboard/admin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

// 1. Update fetchData to combine pre_registrations and leads
const fetchTarget = `    const { data: p } = await supabase.from("pre_registrations").select("*").order("created_at", { ascending: false });
    setPreRegList(p || []);`;

const fetchReplacement = `    const { data: p } = await supabase.from("pre_registrations").select("*").order("created_at", { ascending: false });
    const { data: l } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    
    const combined = [
      ...(p || []).map(x => ({ ...x, _source: 'pre_reg' })),
      ...(l || []).map(x => ({ ...x, _source: 'lead' }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    setPreRegList(combined);`;

if (content.includes(fetchTarget)) {
  content = content.replace(fetchTarget, fetchReplacement);
  console.log('1. Fetch logic combined.');
}

// 2. Update delete logic in the table
const deleteTarget = `await supabase.from("pre_registrations").delete().eq("id", p.id);`;
const deleteReplacement = `await supabase.from(p._source === 'lead' ? 'leads' : 'pre_registrations').delete().eq("id", p.id);`;

if (content.includes(deleteTarget)) {
  content = content.replaceAll(deleteTarget, deleteReplacement);
  console.log('2. Delete logic updated.');
}

// 3. Update upsert logic in the edit dialog
const upsertTarget = `await supabase.from("pre_registrations").upsert({ id: selectedPreReg?.id, ...data });`;
const upsertReplacement = `await supabase.from(selectedPreReg?._source === 'lead' ? 'leads' : 'pre_registrations').upsert({ id: selectedPreReg?.id, ...data });`;

if (content.includes(upsertTarget)) {
  content = content.replace(upsertTarget, upsertReplacement);
  console.log('3. Upsert logic updated.');
}

// 4. Rename the header to 'Student Leads & Staging'
const headerTarget = `<h2 className="text-lg font-black text-navy-deep uppercase tracking-tight">Authorization Staging</h2>`;
const headerReplacement = `<h2 className="text-lg font-black text-navy-deep uppercase tracking-tight">Student Leads & Staging</h2>`;

if (content.includes(headerTarget)) {
  content = content.replace(headerTarget, headerReplacement);
  console.log('4. Header renamed.');
}

// 5. Add a pill in the table to show if it's a manual lead or bulk upload
const cellTarget = `                           <TableCell className="px-5 font-black text-navy-deep uppercase">{p.full_name}</TableCell>`;
const cellReplacement = `                           <TableCell className="px-5 font-black text-navy-deep uppercase">
                              <div className="flex items-center gap-2">
                                 {p.full_name}
                                 {p._source === 'lead' && <span className="bg-purple-100 text-purple-700 text-[8px] px-1.5 py-0.5 rounded-sm tracking-widest border border-purple-200">WEB LEAD</span>}
                              </div>
                           </TableCell>`;

if (content.includes(cellTarget)) {
  content = content.replace(cellTarget, cellReplacement);
  console.log('5. Source pill added to name cell.');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done upgrading admin leads integration!');
