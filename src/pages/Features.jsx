import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { compressImage } from '../lib/imageCompress'
import { buildWhatsAppLink, buildReminderMessage } from '../lib/whatsapp'
import { CalendarDays, Camera, Link2, Users, FileBarChart2, Plus, Trash2, MapPin, RefreshCw, ExternalLink } from 'lucide-react'

const today = () => new Date().toLocaleDateString('en-CA')
const monthStart = (v = today()) => `${v.slice(0,7)}-01`
const fmt = (v) => v ? new Date(`${v}T12:00:00`).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}) : '-'
const errText = (e) => e?.message || 'Terjadi kesalahan. Periksa koneksi dan aturan akses Supabase.'
function Notice({text, bad=false}) { return text ? <div className={`rounded-xl px-4 py-3 text-sm mb-4 ${bad?'bg-red-50 text-red-700':'bg-emerald-50 text-emerald-700'}`}>{text}</div> : null }
function Shell({title,desc,children,action}) { return <div className="space-y-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-extrabold text-slate-800">{title}</h1><p className="text-sm text-slate-500 mt-1">{desc}</p></div>{action}</div>{children}</div> }
function Card({children}) { return <section className="card overflow-hidden">{children}</section> }
function Table({heads,children}) { return <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-slate-50 text-slate-500"><tr>{heads.map(h=><th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{children}</tbody></table></div> }
const td='px-4 py-3 align-middle'

export function JadwalSaya(){
 const {user}=useAuth(); const [rows,setRows]=useState([]); const [busy,setBusy]=useState(true); const [msg,setMsg]=useState('')
 async function load(){setBusy(true);const {data,error}=await supabase.from('schedules').select('*').eq('user_id',user.id).gte('schedule_date',monthStart()).order('schedule_date');setRows(data||[]);setMsg(error?errText(error):'');setBusy(false)}
 useEffect(()=>{load()},[user?.id])
 return <Shell title="Jadwal Saya" desc="Jadwal tugas bulan berjalan, termasuk jadwal toko dan sebar." action={<button className="btn-secondary flex items-center gap-2" onClick={load}><RefreshCw size={16}/> Muat ulang</button>}><Notice text={msg} bad/>{busy?<Card>Memuat jadwal...</Card>:<Card><Table heads={['Tanggal','Tugas','Tim','Status']} >{rows.map(r=><tr key={r.id}><td className={td}>{fmt(r.schedule_date)}</td><td className={td}><span className="font-semibold">{r.role_in_day||'Sebar'}</span></td><td className={td}>{r.team_id ? `Tim ${r.team_id}`:'-'}</td><td className={td}><span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-1 text-xs">{r.status||'scheduled'}</span></td></tr>)}{!rows.length&&<tr><td colSpan="4" className="px-4 py-8 text-center text-slate-500">Belum ada jadwal bulan ini. Hubungi admin.</td></tr>}</Table></Card>}</Shell>
}

export function Absensi(){
 const {user,profile}=useAuth(); const [date,setDate]=useState(today()); const [name,setName]=useState(profile?.full_name||''); const [file,setFile]=useState(null); const [loc,setLoc]=useState(null); const [note,setNote]=useState(''); const [busy,setBusy]=useState(false); const [msg,setMsg]=useState(''); const [bad,setBad]=useState(false); const [rows,setRows]=useState([])
 async function load(){const {data}=await supabase.from('attendance').select('*').eq('user_id',user.id).order('attendance_date',{ascending:false}).limit(20);setRows(data||[])}
 useEffect(()=>{setName(profile?.full_name||'');load()},[user?.id,profile?.full_name])
 function getLoc(){setMsg('Meminta izin lokasi dari perangkat…');if(!navigator.geolocation){setBad(true);setMsg('Perangkat/browser tidak mendukung lokasi.');return}navigator.geolocation.getCurrentPosition(p=>{setLoc({lat:p.coords.latitude,lng:p.coords.longitude});setMsg('Lokasi berhasil dibaca.');setBad(false)},e=>{setBad(true);setMsg('Lokasi tidak diizinkan: '+e.message)}, {enableHighAccuracy:true,timeout:12000})}
 async function submit(e){e.preventDefault();setBusy(true);setMsg('');setBad(false);try{if(!file)throw new Error('Pilih atau ambil foto absensi terlebih dahulu.');if(!loc)throw new Error('Ambil lokasi terlebih dahulu.');const compressed=await compressImage(file);if(compressed.size>1024*1024)throw new Error('Foto masih lebih dari 1 MB. Pilih foto lain.');const path=`${user.id}/${date}-${Date.now()}.jpg`;const up=await supabase.storage.from('attendance-photos').upload(path,compressed,{contentType:'image/jpeg',upsert:false});if(up.error)throw up.error;const {data:pub}=supabase.storage.from('attendance-photos').getPublicUrl(path);const payload={user_id:user.id,attendance_date:date,photo_url:pub.publicUrl,full_name_input:name.trim(),maps_link:`https://www.google.com/maps?q=${loc.lat},${loc.lng}`,note:note.trim()};const {error}=await supabase.from('attendance').insert(payload);if(error)throw error;setMsg('Absensi berhasil dikirim.');setFile(null);setNote('');await load()}catch(e){setBad(true);setMsg(errText(e))}finally{setBusy(false)}}
 return <Shell title="Absensi" desc="Ambil foto, izinkan lokasi perangkat, lalu kirim laporan ke admin."><Notice text={msg} bad={bad}/><Card><form className="p-5 grid md:grid-cols-2 gap-4" onSubmit={submit}><div><label className="label">Tanggal absensi</label><input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} required/></div><div><label className="label">Nama sesuai profil</label><input className="input" value={name} onChange={e=>setName(e.target.value)} required/></div><div className="md:col-span-2"><label className="label">Foto absensi (maks. 1 MB setelah kompres)</label><input className="input" type="file" accept="image/*" capture="environment" onChange={e=>setFile(e.target.files?.[0]||null)} required/><p className="text-xs text-slate-500 mt-1">Di HP, pilih kamera atau galeri dari menu yang muncul.</p></div><div className="md:col-span-2 flex flex-wrap gap-2"><button type="button" className="btn-secondary flex gap-2 items-center" onClick={getLoc}><MapPin size={16}/> {loc?'Lokasi berhasil diambil':'Ambil lokasi GPS'}</button>{loc&&<span className="text-xs text-slate-500 self-center">{loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}</span>}</div><div className="md:col-span-2"><label className="label">Catatan (opsional)</label><textarea className="input min-h-20" value={note} onChange={e=>setNote(e.target.value)} placeholder="Contoh: tiba di toko"/></div><div className="md:col-span-2"><button className="btn-primary" disabled={busy}>{busy?'Mengirim…':'Kirim Absensi'}</button></div></form></Card><Card><div className="p-4 font-bold">Riwayat absensi</div><Table heads={['Tanggal','Nama','Foto','Lokasi']}>{rows.map(r=><tr key={r.id}><td className={td}>{fmt(r.attendance_date)}</td><td className={td}>{r.full_name_input||profile?.full_name}</td><td className={td}>{r.photo_url?<a className="text-blue-600 underline" href={r.photo_url} target="_blank" rel="noreferrer">Lihat foto</a>:'-'}</td><td className={td}>{r.maps_link?<a className="text-blue-600 inline-flex gap-1" href={r.maps_link} target="_blank" rel="noreferrer">Peta <ExternalLink size={13}/></a>:'-'}</td></tr>)}{!rows.length&&<tr><td colSpan="4" className="px-4 py-6 text-center text-slate-500">Belum ada absensi.</td></tr>}</Table></Card></Shell>
}

export function UploadLink(){
 const {user}=useAuth();const [date,setDate]=useState(today());const [platform,setPlatform]=useState('instagram');const [url,setUrl]=useState('');const [rows,setRows]=useState([]);const [busy,setBusy]=useState(false);const [msg,setMsg]=useState('');const [bad,setBad]=useState(false)
 async function load(){const {data}=await supabase.from('content_links').select('*').eq('user_id',user.id).eq('link_date',date).order('created_at');setRows(data||[])}useEffect(()=>{load()},[user?.id,date])
 async function submit(e){e.preventDefault();setMsg('');setBad(false);try{if(rows.length>=3)throw new Error('Batas maksimal 3 link per hari untuk semua platform sudah tercapai.');const u=new URL(url);if(!['http:','https:'].includes(u.protocol))throw new Error('Gunakan URL http/https yang valid.');setBusy(true);const {error}=await supabase.from('content_links').insert({user_id:user.id,link_date:date,platform,url:u.href});if(error)throw error;setUrl('');setMsg('Link berhasil dilaporkan.');await load()}catch(e){setBad(true);setMsg(errText(e))}finally{setBusy(false)}}
 async function remove(id){if(!confirm('Hapus laporan link ini?'))return;const {error}=await supabase.from('content_links').delete().eq('id',id);if(error){setBad(true);setMsg(errText(error))}else load()}
 return <Shell title="Upload Link Sebar" desc="Maksimal 3 laporan link per hari, dihitung gabungan seluruh platform."><Notice text={msg} bad={bad}/><Card><form onSubmit={submit} className="p-5 grid md:grid-cols-3 gap-4"><div><label className="label">Tanggal</label><input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} required/></div><div><label className="label">Platform</label><select className="input" value={platform} onChange={e=>setPlatform(e.target.value)}>{['instagram','facebook','tiktok','olx','threads'].map(p=><option key={p} value={p}>{p[0].toUpperCase()+p.slice(1)}</option>)}</select></div><div><label className="label">Link postingan</label><input className="input" type="url" placeholder="https://…" value={url} onChange={e=>setUrl(e.target.value)} required/></div><div className="md:col-span-3 flex items-center justify-between gap-3"><span className="text-sm text-slate-500">Terpakai {rows.length}/3 link hari ini</span><button className="btn-primary" disabled={busy||rows.length>=3}>{busy?'Menyimpan…':'Kirim Link'}</button></div></form></Card><Card><div className="p-4 font-bold">Laporan tanggal {fmt(date)}</div><Table heads={['Platform','URL','Waktu','Aksi']}>{rows.map(r=><tr key={r.id}><td className={td}>{r.platform}</td><td className={`${td} max-w-64 truncate`}><a href={r.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">{r.url}</a></td><td className={td}>{r.created_at?new Date(r.created_at).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}):'-'}</td><td className={td}><button className="text-red-600" onClick={()=>remove(r.id)}><Trash2 size={16}/></button></td></tr>)}{!rows.length&&<tr><td colSpan="4" className="px-4 py-6 text-center text-slate-500">Belum ada link dilaporkan.</td></tr>}</Table></Card></Shell>
}


export function KelolaAnggota() {
  const [rows, setRows] = useState([])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [bad, setBad] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    whatsapp: '',
    team_id: '1',
  })
  const [editId, setEditId] = useState(null)

  async function load() {
    setBusy(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id,full_name,email,whatsapp,team_id,role,is_active,created_at')
      .order('full_name')

    setRows(data || [])

    if (error) {
      setBad(true)
      setMsg(errText(error))
    }

    setBusy(false)
  }

  useEffect(() => {
    load()
  }, [])

  function resetForm() {
    setEditId(null)
    setForm({
      full_name: '',
      email: '',
      password: '',
      whatsapp: '',
      team_id: '1',
    })
  }

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    setBad(false)

    try {
      if (editId) {
        // Update profil anggota yang sudah ada.
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: form.full_name.trim(),
            whatsapp: form.whatsapp.trim() || null,
            team_id: Number(form.team_id),
          })
          .eq('id', editId)

        if (error) throw error

        setMsg('Profil anggota berhasil diperbarui.')
      } else {
        // Buat akun login melalui Supabase Edge Function.
        if (!form.password || form.password.length < 8) {
          throw new Error('Password wajib diisi, minimal 8 karakter.')
        }

        const { data, error } = await supabase.functions.invoke(
          'create-member',
          {
            body: {
              full_name: form.full_name.trim(),
              email: form.email.trim().toLowerCase(),
              password: form.password,
              whatsapp: form.whatsapp.trim() || null,
              team_id: form.team_id,
            },
          }
        )

        if (error) {
          let detail = error.message || 'Gagal memanggil Edge Function.'

          try {
            const context = error.context
            if (context && typeof context.json === 'function') {
              const body = await context.json()
              if (body?.error) detail = body.error
            }
          } catch {
            // Gunakan pesan error awal jika respons bukan JSON.
          }

          throw new Error(detail)
        }

        if (data?.error || !data?.success) {
          throw new Error(data?.error || 'Akun anggota gagal dibuat.')
        }

        setMsg('Akun login dan profil anggota berhasil dibuat.')
      }

      resetForm()
      await load()
    } catch (e) {
      setBad(true)
      setMsg(errText(e))
    } finally {
      setBusy(false)
    }
  }

  async function toggle(r) {
    setMsg('')
    setBad(false)

    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !r.is_active })
      .eq('id', r.id)

    if (error) {
      setBad(true)
      setMsg(errText(error))
    } else {
      setMsg('Status anggota berhasil diperbarui.')
      await load()
    }
  }

  function edit(r) {
    setEditId(r.id)
    setForm({
      full_name: r.full_name || '',
      email: r.email || '',
      password: '',
      whatsapp: r.whatsapp || '',
      team_id: String(r.team_id || 1),
    })

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Shell
      title="Kelola Anggota"
      desc="Buat akun login, atur profil, tim, WhatsApp, dan status anggota."
      action={
        <button
          type="button"
          className="btn-secondary flex items-center gap-2"
          onClick={load}
          disabled={busy}
        >
          <RefreshCw size={16} />
          Muat ulang
        </button>
      }
    >
      <Notice text={msg} bad={bad} />

      <Card>
        <form className="p-5 grid md:grid-cols-2 gap-4" onSubmit={save}>
          <div>
            <label className="label">Nama lengkap</label>
            <input
              className="input"
              value={form.full_name}
              onChange={(e) =>
                setForm({ ...form, full_name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="label">Email akun</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              disabled={!!editId}
              required
            />
          </div>

          {!editId && (
            <div>
              <label className="label">Password akun</label>
              <input
                className="input"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder="Minimal 8 karakter"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Berikan password ini kepada anggota secara aman.
              </p>
            </div>
          )}

          <div>
            <label className="label">WhatsApp</label>
            <input
              className="input"
              type="tel"
              value={form.whatsapp}
              onChange={(e) =>
                setForm({ ...form, whatsapp: e.target.value })
              }
              placeholder="62812..."
            />
          </div>

          <div>
            <label className="label">Tim</label>
            <select
              className="input"
              value={form.team_id}
              onChange={(e) =>
                setForm({ ...form, team_id: e.target.value })
              }
              required
            >
              <option value="1">Tim 1</option>
              <option value="2">Tim 2</option>
            </select>
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
              disabled={busy}
            >
              <Plus size={16} />
              {busy
                ? 'Memproses...'
                : editId
                  ? 'Simpan perubahan'
                  : 'Buat akun anggota'}
            </button>

            {editId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
                disabled={busy}
              >
                Batal edit
              </button>
            )}
          </div>
        </form>
      </Card>

      <Card>
        <Table
          heads={[
            'Anggota',
            'Email',
            'Tim',
            'WhatsApp',
            'Status',
            'Aksi',
          ]}
        >
          {rows.map((r) => (
            <tr key={r.id}>
              <td className={td}>
                <div className="font-semibold">
                  {r.full_name || '-'}
                </div>
                <div className="text-xs text-slate-400">
                  {r.role}
                </div>
              </td>

              <td className={td}>{r.email || '-'}</td>

              <td className={td}>
                {r.team_id ? `Tim ${r.team_id}` : '-'}
              </td>

              <td className={td}>{r.whatsapp || '-'}</td>

              <td className={td}>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    r.is_active === false
                      ? 'bg-red-50 text-red-600'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {r.is_active === false ? 'Nonaktif' : 'Aktif'}
                </span>
              </td>

              <td className={td}>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="text-blue-600"
                    onClick={() => edit(r)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="text-amber-700"
                    onClick={() => toggle(r)}
                  >
                    {r.is_active === false
                      ? 'Aktifkan'
                      : 'Nonaktifkan'}
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {!rows.length && (
            <tr>
              <td
                colSpan="6"
                className="px-4 py-6 text-center text-slate-500"
              >
                {busy
                  ? 'Memuat anggota...'
                  : 'Belum ada profil anggota.'}
              </td>
            </tr>
          )}
        </Table>
      </Card>
    </Shell>
  )
           }
export function GenerateJadwal() {
  const [members, setMembers] = useState([])
  const [holidays, setHolidays] = useState([])
  const [month, setMonth] = useState(today().slice(0, 7))
  const [start, setStart] = useState('')
  const [holidayUser, setHolidayUser] = useState('')
  const [holidayDay, setHolidayDay] = useState('1')
  const [holidayNote, setHolidayNote] = useState('Libur rutin')
  const [msg, setMsg] = useState('')
  const [bad, setBad] = useState(false)
  const [busy, setBusy] = useState(false)

  const dayNames = [
    'Minggu',
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
  ]

  async function load() {
    const [memberResult, holidayResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id,full_name,team_id,is_active')
        .eq('role', 'member')
        .order('full_name'),

      supabase
        .from('holidays')
        .select('*')
        .gte('holiday_date', `${month}-01`)
        .lte(
          'holiday_date',
          `${month}-${String(
            new Date(
              Number(month.slice(0, 4)),
              Number(month.slice(5, 7)),
              0
            ).getDate()
          ).padStart(2, '0')}`
        )
        .order('holiday_date'),
    ])

    if (memberResult.error) {
      setBad(true)
      setMsg(errText(memberResult.error))
      return
    }

    if (holidayResult.error) {
      setBad(true)
      setMsg(errText(holidayResult.error))
      return
    }

    const activeMembers = (memberResult.data || []).filter(
      (member) => member.is_active !== false
    )

    setMembers(activeMembers)
    setHolidays(holidayResult.data || [])

    setHolidayUser((current) =>
      activeMembers.some((member) => member.id === current)
        ? current
        : activeMembers[0]?.id || ''
    )
  }

  useEffect(() => {
    load()
  }, [month])

  async function addHoliday(e) {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    setBad(false)

    try {
      if (!holidayUser) {
        throw new Error('Pilih anggota terlebih dahulu.')
      }

      const [year, monthNumber] = month.split('-').map(Number)
      const totalDays = new Date(year, monthNumber, 0).getDate()
      const weekday = Number(holidayDay)

      const dates = []

      for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, monthNumber - 1, day)

        if (date.getDay() === weekday) {
          dates.push(
            `${year}-${String(monthNumber).padStart(2, '0')}-${String(
              day
            ).padStart(2, '0')}`
          )
        }
      }

      if (!dates.length) {
        throw new Error('Tidak ditemukan tanggal untuk hari tersebut.')
      }

      const existing = holidays.filter(
        (holiday) => holiday.user_id === holidayUser
      )

      const inserts = dates
        .filter(
          (date) =>
            !existing.some((holiday) => holiday.holiday_date === date)
        )
        .map((date) => ({
          user_id: holidayUser,
          holiday_date: date,
          month_period: `${month}-01`,
          note: `${holidayNote.trim() || 'Libur rutin'} (${dayNames[weekday]})`,
        }))

      if (!inserts.length) {
        throw new Error(
          `Libur ${dayNames[weekday]} untuk anggota ini sudah tercatat pada bulan tersebut.`
        )
      }

      const { error } = await supabase.from('holidays').insert(inserts)

      if (error) throw error

      setMsg(
        `Berhasil menyimpan ${inserts.length} tanggal libur setiap ${dayNames[weekday]} untuk bulan ${month}.`
      )

      await load()
    } catch (error) {
      setBad(true)
      setMsg(errText(error))
    } finally {
      setBusy(false)
    }
  }

  async function deleteHoliday(id) {
    if (!confirm('Hapus tanggal libur ini?')) return

    const { error } = await supabase
      .from('holidays')
      .delete()
      .eq('id', id)

    if (error) {
      setBad(true)
      setMsg(errText(error))
    } else {
      setMsg('Tanggal libur berhasil dihapus.')
      await load()
    }
  }

  async function generate(e) {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    setBad(false)

    try {
      if (members.length < 3) {
        throw new Error(
          'Minimal 3 anggota aktif diperlukan untuk pembagian tugas Toko dan Sebar.'
        )
      }

      const [year, monthNumber] = month.split('-').map(Number)
      const totalDays = new Date(year, monthNumber, 0).getDate()
      const from = start ? Number(start.slice(-2)) : 1

      if (
        start &&
        !start.startsWith(`${month}-`)
      ) {
        throw new Error(
          'Tanggal mulai harus berada pada bulan jadwal yang dipilih.'
        )
      }

      if (from < 1 || from > totalDays) {
        throw new Error('Tanggal mulai tidak valid.')
      }

      const { data: holidayRows, error: holidayError } = await supabase
        .from('holidays')
        .select('user_id,holiday_date')
        .gte('holiday_date', `${month}-01`)
        .lte(
          'holiday_date',
          `${month}-${String(totalDays).padStart(2, '0')}`
        )

      if (holidayError) throw holidayError

      const off = new Set(
        (holidayRows || []).map(
          (holiday) => `${holiday.user_id}|${holiday.holiday_date}`
        )
      )

      const dates = []

      for (let day = from; day <= totalDays; day++) {
        const date = new Date(year, monthNumber - 1, day)

        // Sabtu dan Minggu tidak dijadwalkan.
        if (date.getDay() === 0 || date.getDay() === 6) continue

        dates.push({
          date,
          dateString: `${year}-${String(monthNumber).padStart(
            2,
            '0'
          )}-${String(day).padStart(2, '0')}`,
          day,
        })
      }

      if (!dates.length) {
        throw new Error(
          'Tidak ada hari kerja pada rentang tanggal yang dipilih.'
        )
      }

      const sorted = [...members].sort((a, b) =>
        (a.full_name || '').localeCompare(b.full_name || '')
      )

      const workload = Object.fromEntries(
        sorted.map((member) => [member.id, 0])
      )

      const roleCount = Object.fromEntries(
        sorted.map((member) => [
          member.id,
          { Toko: 0, Sebar: 0 },
        ])
      )

      const inserts = []

      for (const item of dates) {
        const { date, dateString, day } = item

        const eligible = sorted.filter(
          (member) => !off.has(`${member.id}|${dateString}`)
        )

        if (eligible.length < 3) {
          continue
        }

        // Senin sampai Kamis: satu anggota Sebar,
        // anggota lainnya bertugas di Toko.
        // Jumat: semua anggota yang tersedia bertugas di Toko.
        let sebarMember = null

        if (date.getDay() >= 1 && date.getDay() <= 4) {
          sebarMember = [...eligible].sort((a, b) => {
            const roleDifference =
              roleCount[a.id].Sebar - roleCount[b.id].Sebar

            if (roleDifference !== 0) return roleDifference

            const workloadDifference = workload[a.id] - workload[b.id]

            if (workloadDifference !== 0) return workloadDifference

            return (a.full_name || '').localeCompare(b.full_name || '')
          })[0]
        }

        for (const member of eligible) {
          const role =
            sebarMember && member.id === sebarMember.id
              ? 'Sebar'
              : 'Toko'

          inserts.push({
            user_id: member.id,
            team_id: member.team_id || 1,
            schedule_date: dateString,
            week_number: Math.floor((day - 1) / 7) + 1,
            role_in_day: role,
            status: 'scheduled',
          })

          workload[member.id] += 1
          roleCount[member.id][role] += 1
        }
      }

      if (!inserts.length) {
        throw new Error(
          'Tidak ada jadwal yang dapat dibuat. Periksa jumlah anggota aktif dan tanggal libur.'
        )
      }

      // Hapus jadwal lama hanya dalam rentang yang akan dibuat ulang.
      const { error: deleteError } = await supabase
        .from('schedules')
        .delete()
        .gte(
          'schedule_date',
          `${month}-${String(from).padStart(2, '0')}`
        )
        .lte(
          'schedule_date',
          `${month}-${String(totalDays).padStart(2, '0')}`
        )

      if (deleteError) throw deleteError

      // Masukkan jadwal per kelompok agar tidak mengirim
      // terlalu banyak data dalam satu permintaan.
      for (let i = 0; i < inserts.length; i += 200) {
        const { error } = await supabase
          .from('schedules')
          .insert(inserts.slice(i, i + 200))

        if (error) throw error
      }

      const summary = sorted
        .map(
          (member) =>
            `${member.full_name}: Toko ${roleCount[member.id].Toko}, Sebar ${roleCount[member.id].Sebar}`
        )
        .join(' • ')

      setMsg(
        `Berhasil membuat ${inserts.length} entri jadwal untuk ${month}. Rekap tugas: ${summary}`
      )
    } catch (error) {
      setBad(true)
      setMsg(errText(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Shell
      title="Generate Jadwal Bulanan"
      desc="Atur libur rutin anggota dan rotasi tugas Toko/Sebar."
    >
      <Notice text={msg} bad={bad} />

      <Card>
        <form
          className="p-5 flex flex-wrap items-end gap-3"
          onSubmit={generate}
        >
          <div>
            <label className="label">Bulan jadwal</label>
            <input
              className="input"
              type="month"
              value={month}
              onChange={(e) => {
                setMonth(e.target.value)
                setStart('')
              }}
              required
            />
          </div>

          <div>
            <label className="label">Mulai dari tanggal (opsional)</label>
            <input
              className="input"
              type="date"
              value={start}
              min={`${month}-01`}
              max={`${month}-${String(
                new Date(
                  Number(month.slice(0, 4)),
                  Number(month.slice(5, 7)),
                  0
                ).getDate()
              ).padStart(2, '0')}`}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>

          <button className="btn-primary" disabled={busy}>
            {busy ? 'Membuat jadwal...' : 'Generate Jadwal'}
          </button>
        </form>

        <p className="px-5 pb-5 text-xs text-slate-500">
          Senin–Kamis: satu anggota Sebar dan anggota lainnya Toko.
          Jumat: anggota yang tersedia bertugas di Toko. Sabtu dan
          Minggu tidak dijadwalkan. Jadwal pada rentang yang dipilih
          akan diganti saat generate.
        </p>
      </Card>

      <Card>
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-bold">Atur libur rutin anggota</h2>
          <p className="text-sm text-slate-500 mt-1">
            Pilih satu hari dalam seminggu. Sistem akan menyimpan
            seluruh tanggal hari tersebut untuk bulan yang dipilih.
          </p>
        </div>

        <form
          className="p-5 grid md:grid-cols-2 gap-3"
          onSubmit={addHoliday}
        >
          <div>
            <label className="label">Anggota</label>
            <select
              className="input"
              value={holidayUser}
              onChange={(e) => setHolidayUser(e.target.value)}
              required
            >
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Libur setiap hari</label>
            <select
              className="input"
              value={holidayDay}
              onChange={(e) => setHolidayDay(e.target.value)}
              required
            >
              {dayNames.map((day, index) => (
                <option key={day} value={String(index)}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Catatan</label>
            <input
              className="input"
              value={holidayNote}
              onChange={(e) => setHolidayNote(e.target.value)}
              placeholder="Contoh: Libur rutin"
            />
          </div>

          <div className="flex items-end">
            <button
              className="btn-secondary flex items-center gap-2"
              disabled={busy || !members.length}
            >
              <Plus size={16} />
              Simpan libur rutin
            </button>
          </div>
        </form>

        <Table heads={['Anggota', 'Tanggal libur', 'Catatan', 'Aksi']}>
          {holidays.map((holiday) => (
            <tr key={holiday.id}>
              <td className={td}>
                {members.find(
                  (member) => member.id === holiday.user_id
                )?.full_name || holiday.user_id}
              </td>

              <td className={td}>{fmt(holiday.holiday_date)}</td>

              <td className={td}>{holiday.note || '-'}</td>

              <td className={td}>
                <button
                  type="button"
                  className="text-red-600"
                  onClick={() => deleteHoliday(holiday.id)}
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}

          {!holidays.length && (
            <tr>
              <td
                colSpan="4"
                className="px-4 py-6 text-center text-slate-500"
              >
                Belum ada hari libur bulan ini.
              </td>
            </tr>
          )}
        </Table>
      </Card>
    </Shell>
  )
}

export function Laporan(){
 const [month,setMonth]=useState(today().slice(0,7));const [profiles,setProfiles]=useState([]);const [attendance,setAttendance]=useState([]);const [links,setLinks]=useState([]);const [busy,setBusy]=useState(false);const [msg,setMsg]=useState('')
 async function load(){setBusy(true);const from=`${month}-01`;const to=`${month}-${new Date(Number(month.slice(0,4)),Number(month.slice(5,7)),0).getDate()}`;const [p,a,l]=await Promise.all([supabase.from('profiles').select('id,full_name,whatsapp,team_id,role,is_active').eq('role','member'),supabase.from('attendance').select('*').gte('attendance_date',from).lte('attendance_date',to),supabase.from('content_links').select('*').gte('link_date',from).lte('link_date',to)]);setProfiles(p.data||[]);setAttendance(a.data||[]);setLinks(l.data||[]);setMsg([p.error,a.error,l.error].filter(Boolean).map(errText).join(' • '));setBusy(false)}useEffect(()=>{load()},[month])
 const stats=useMemo(()=>profiles.map(p=>{const at=attendance.filter(a=>a.user_id===p.id).length;const li=links.filter(l=>l.user_id===p.id).length;const days=new Set(links.filter(l=>l.user_id===p.id).map(l=>l.link_date));const compliant=days.size?Math.min(100,Math.round([...days].filter(d=>links.filter(l=>l.user_id===p.id&&l.link_date===d).length>=3).length/days.size*100)):0;return {...p,at,li,compliant}}),[profiles,attendance,links])
 return <Shell title="Laporan & KPI" desc="Pantau absensi, jumlah link, dan hubungi anggota yang belum lengkap." action={<div className="flex gap-2"><input className="input" type="month" value={month} onChange={e=>setMonth(e.target.value)}/><button className="btn-secondary" onClick={load}><RefreshCw size={16}/></button></div>}><Notice text={msg} bad={!!msg}/><div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[{l:'Anggota',v:profiles.length},{l:'Absensi',v:attendance.length},{l:'Link terlapor',v:links.length},{l:'Belum 3 link/hari',v:stats.filter(s=>s.compliant<100).length}].map(s=><Card key={s.l}><div className="p-4"><div className="text-xs text-slate-500">{s.l}</div><div className="text-2xl font-extrabold mt-1">{s.v}</div></div></Card>)}</div><Card><Table heads={['Anggota','Tim','Absensi','Link','Kepatuhan link','WhatsApp']}>{stats.map(p=><tr key={p.id}><td className={td}><div className="font-semibold">{p.full_name}</div></td><td className={td}>{p.team_id||'-'}</td><td className={td}>{p.at}</td><td className={td}>{p.li}</td><td className={td}><span className={`rounded-full px-2 py-1 text-xs ${p.compliant===100?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-800'}`}>{p.compliant}%</span></td><td className={td}>{p.whatsapp&&p.compliant<100?<a className="text-emerald-700 underline" href={buildWhatsAppLink(p.whatsapp,buildReminderMessage(p.full_name,'upload link hari ini'))} target="_blank" rel="noreferrer">Ingatkan WA</a>:'-'}</td></tr>)}{!stats.length&&<tr><td colSpan="6" className="px-4 py-6 text-center text-slate-500">{busy?'Memuat laporan…':'Belum ada data.'}</td></tr>}</Table></Card><p className="text-xs text-slate-500">KPI link dihitung dari hari yang memiliki laporan: 100% jika setiap hari yang dilaporkan memiliki 3 link. Untuk KPI berdasarkan seluruh hari sebar terjadwal, gunakan view v_user_compliance yang tersedia di database.</p></Shell>
}
