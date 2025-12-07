import { email, z } from "zod";

const emailSchema = z.string().email('Email tidak valid').toLowerCase().trim()
const passwordSchema = z
    .string()
    .min(8, 'Kata sandi harus memiliki minimal 8 karakter')
    .regex(/[A-Z]/, 'Kata sandi harus mengandung setidaknya satu huruf kapital')
    .regex(/[a-z]/, 'Kata sandi harus mengandung setidaknya satu huruf kecil')
    .regex(/[0-9]/, 'Kata sandi harus mengandung setidaknya satu angka')
    .regex(/[^A-Za-z0-9]/, 'Kata sandi harus mengandung setidaknya satu karakter khusus')

const nameScheme = z
    .string()
    .min(2, 'Nama harus memiliki minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter')
    .regex(/^[a-zA-Z\s'-]+$/, 'Nama hanya boleh mengandung huruf, spasi, tanda petik, dan tanda hubung')
    .trim()

export const registerSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    nama: nameScheme,
    confirmPassword: z.string(),
}).refine((data) => data.password  === data.confirmPassword, {
    message: 'Kata sandi dan konfirmasi kata sandi harus sama',
    path: ['confirmPassword'],
})

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Kata sandi tidak boleh kosong'),
})

export const createBusinessSchema = z.object({
    namaUsaha: z
        .string()
        .min(2, 'Nama usaha harus memiliki minimal 2 karakter')
        .max(200, 'Nama usaha maksimal 200 karakter')
        .trim(),
    jenisUsaha: z
        .string()
        .min(2, 'Jenis usaha harus memiliki minimal 2 karakter')
        .max(100, 'Jenis usaha maksimal 100 karakter')
        .trim(),
    deskripsi: z
        .string()
        .max(2000, 'Deskripsi maksimal 2000 karakter')
        .optional()
        .nullable(),
    modalAwal: z
        .number()
        .min(0, 'Modal awal ga boleh negatif ya')
        .max(999999999, 'Modal awal terlalu besar')
        .optional()
        .nullable(),
    pendapatanBulanan: z
        .number()
        .min(0, 'Pengeluaran tidak boleh negatif')
        .max(999999999, 'Pendapatan terlalu besar')
        .optional()
        .nullable(),
    pengeluaranBulanan: z
        .number()
        .min(0, 'Pengeluaran tidak boleh negatif')
        .max(9999999999, 'Pengeluaran terlalu besar')
        .optional()
        .nullable(),
    jumlahKaryawan: z
        .number()
        .int('Jumlah karyawan harus bilangan bulat')
        .min(0, 'Jumlah karyawan tidak boleh negatif')
        .max(10000, 'Jumlah karyawan terlalu besar')
        .optional()
        .nullable(),
    lokasi: z
        .string()
        .max(255, 'Lokasi maksimal 255 karakter')
        .optional()
        .nullable(),
    tantangan: z    
        .array(z.string().max(200))
        .max(10, 'Maksimal 10 tantangan')
        .optional()
        .nullable()
})

export const updateBusinessSchema = createBusinessSchema.partial()

//Chat schema
export const chatMessageSchema = z.object({
    message: z
        .string()
        .min(1, 'Pesan tidak boleh kosong')
        .max(5000, 'Pesan maksimal 5000 karakter')
        .trim(),
    businessId: z.string().uuid('ID bisnis tidak valid').optional().nullable(),
})

//Uuid validator
export const uuidSchema = z.string().uuid('ID tidak valid');

//Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
})


//Tyoe export
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessInput = z.    infer<typeof updateBusinessSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;