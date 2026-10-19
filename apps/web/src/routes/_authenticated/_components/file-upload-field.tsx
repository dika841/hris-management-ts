import { Button } from "@app/components/ui/button";
import { Label } from "@app/components/ui/label";
import { FileUp, Loader2, X } from "lucide-react";
import { useState, type ChangeEvent, type FC, type ReactElement } from "react";

type TFileUploadFieldProps = {
	id: string;
	label: string;
	folder: string;
	value: string;
	onChange: (value: string) => void;
	accept?: string;
	required?: boolean;
};

type TPresignResponse = {
	presignUrl: string;
	publicUrl: string | null;
};

const safeFileName = (name: string): string =>
	name.replace(/[^a-zA-Z0-9._-]/g, "_");

export const FileUploadField: FC<TFileUploadFieldProps> = (
	props,
): ReactElement => {
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const upload = async (
		event: ChangeEvent<HTMLInputElement>,
	): Promise<void> => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;

		setUploading(true);
		setError(null);

		try {
			const key = `${props.folder}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
			const presignResponse = await fetch("/api/upload/presign", {
				method: "POST",
				credentials: "include",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ key, contentType: file.type }),
			});

			if (!presignResponse.ok) {
				throw new Error("Gagal membuat URL upload.");
			}

			const presign = (await presignResponse.json()) as TPresignResponse;
			if (!presign.publicUrl) {
				throw new Error(
					"STORAGE_PUBLIC_URL belum dikonfigurasi di server. Hubungi administrator.",
				);
			}

			const putResponse = await fetch(presign.presignUrl, {
				method: "PUT",
				headers: { "content-type": file.type },
				body: file,
			});
			if (!putResponse.ok) {
				throw new Error("Upload file ke storage gagal.");
			}

			props.onChange(presign.publicUrl);
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Upload gagal.");
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="space-y-1.5">
			<Label htmlFor={props.id} className="text-xs font-medium">
				{props.label}
				{props.required && <span className="text-destructive"> *</span>}
			</Label>
			<div className="flex flex-wrap items-center gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={uploading}
					asChild
					className="gap-1.5 text-xs"
				>
					<label htmlFor={props.id} className="cursor-pointer">
						{uploading ? (
							<Loader2 className="size-3.5 animate-spin" />
						) : (
							<FileUp className="size-3.5" />
						)}
						{uploading ? "Mengunggah..." : "Pilih File"}
					</label>
				</Button>
				<input
					id={props.id}
					type="file"
					accept={
						props.accept ?? "application/pdf,image/jpeg,image/png,image/webp"
					}
					onChange={(event) => void upload(event)}
					className="sr-only"
					disabled={uploading}
				/>
				{props.value && (
					<>
						<a
							href={props.value}
							target="_blank"
							rel="noreferrer"
							className="max-w-[220px] truncate text-xs text-primary underline-offset-4 hover:underline"
						>
							Lihat dokumen
						</a>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => props.onChange("")}
							className="size-7 p-0 text-muted-foreground hover:text-destructive"
							title="Hapus dokumen"
						>
							<X className="size-3.5" />
						</Button>
					</>
				)}
			</div>
			{error && <p className="text-[11px] text-destructive">{error}</p>}
			<p className="text-[10px] text-muted-foreground">
				PDF, JPG, PNG, atau WebP. Maksimal sesuai konfigurasi server.
			</p>
		</div>
	);
};
