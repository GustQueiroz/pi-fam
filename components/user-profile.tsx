"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, X } from "lucide-react";
import { userService } from "@/services/api";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  photo?: string | null;
  role: string;
}

interface UserProfileProps {
  user: User | null;
}

export function UserProfile({ user }: UserProfileProps) {
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [photo, setPhoto] = useState<string | null>(user?.photo || null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return <div>Usuário não encontrado</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await userService.update(user.id, {
        name,
        phone,
        photo,
      });

      setSuccess(true);

      window.location.reload();
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("A foto deve ter no máximo 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meus Dados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center mb-6 sm:flex-row sm:items-start sm:mb-8">
          <div className="relative mb-4 sm:mb-0 sm:mr-6">
            <Avatar className="h-24 w-24">
              {photo ? <AvatarImage src={photo} alt={name} /> : null}
              <AvatarFallback className="text-2xl">
                {name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="mt-2 flex justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1"
              >
                <Camera className="h-4 w-4" />
                <span>Alterar</span>
              </Button>
              {photo && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemovePhoto}
                  className="flex items-center gap-1 text-destructive border-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                  <span>Remover</span>
                </Button>
              )}
              <Input
                id="photo"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
          </div>
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user.email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Cargo</Label>
                <Input
                  id="role"
                  value={
                    user.role === "administrador" ? "Administrador" : "Usuário"
                  }
                  disabled
                />
              </div>
            </div>

            {success && (
              <p className="text-green-500">Perfil atualizado com sucesso!</p>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
