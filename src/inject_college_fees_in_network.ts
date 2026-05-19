import fs from 'fs';

const filePath = 'c:/Users/rauna/Desktop/hellointernugc/src/routes/dashboard/admin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

const target = `               ) : !explorerCol ? (
                  <div className="divide-y">
                     {activeUniData?.colleges?.filter((c: any) => c.name.toLowerCase().includes(colSearch.toLowerCase())).map((col: any) => (
                        <div key={col.id} className="group flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                           <div className="flex items-center gap-4">
                              <div className="size-10 rounded-xl bg-amber-50 text-amber-600 grid place-items-center"><Building2 size={20}/></div>
                              <div>
                                 <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{col.name}</div>
                                 <div className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Affiliated Institute</div>
                              </div>
                           </div>
                           <div className="flex gap-2 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                              <Button size="icon" variant="ghost" className="size-8 rounded-lg border" onClick={() => { setSelectedColForStructure(col); setSelectedUniForCollege(activeUniData); setIsEditColOpen(true); }}><Edit size={16}/></Button>
                              <Button size="icon" variant="ghost" className="size-8 rounded-lg border text-red-500" onClick={async () => { if(confirm("Delete College?")) { await supabase.from("colleges").delete().eq("id", col.id); fetchData(); } }}><Trash2 size={16}/></Button>
                           </div>
                        </div>
                     ))}
                  </div>`;

const replacement = `               ) : !explorerCol ? (
                  <div className="divide-y">
                     {activeUniData?.colleges?.filter((c: any) => c.name.toLowerCase().includes(colSearch.toLowerCase())).map((col: any) => (
                        <div key={col.id} className="group flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                           <div className="flex items-center gap-4">
                              <div className="size-10 rounded-xl bg-amber-50 text-amber-600 grid place-items-center"><Building2 size={20}/></div>
                              <div>
                                 <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{col.name}</div>
                                 <div className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Affiliated Institute</div>
                              </div>
                           </div>
                           <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                 <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Fee (₹):</span>
                                 <input
                                    type="number"
                                    defaultValue={settings?.college_fees?.[col.id] || ""}
                                    placeholder={settings?.registration_fee || "1500"}
                                    onChange={async (e) => {
                                       const val = e.target.value;
                                       const newFees = { ...(settings?.college_fees || {}) };
                                       if (val) {
                                          newFees[col.id] = Number(val);
                                       } else {
                                          delete newFees[col.id];
                                       }
                                       const { error } = await supabase
                                          .from("portal_settings")
                                          .upsert({ 
                                             id: 'global', 
                                             ...settings,
                                             college_fees: newFees 
                                          });
                                       if (!error) {
                                          setSettings({ ...(settings || {}), college_fees: newFees });
                                          toast.success("Fee updated!");
                                       } else {
                                          toast.error("Failed to update fee: " + error.message);
                                       }
                                    }}
                                    className="h-8 w-24 font-bold text-right text-xs rounded-lg border-2 px-2 focus:border-gold outline-none"
                                 />
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                                 <Button size="icon" variant="ghost" className="size-8 rounded-lg border" onClick={() => { setSelectedColForStructure(col); setSelectedUniForCollege(activeUniData); setIsEditColOpen(true); }}><Edit size={16}/></Button>
                                 <Button size="icon" variant="ghost" className="size-8 rounded-lg border text-red-500" onClick={async () => { if(confirm("Delete College?")) { await supabase.from("colleges").delete().eq("id", col.id); fetchData(); } }}><Trash2 size={16}/></Button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  console.log('Successfully injected college-wise fee override input directly into the university explorer rows!');
} else {
  // Let's do a loose check in case of spacing or tabs
  console.error('Failed to match explorer target block!');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done!');
