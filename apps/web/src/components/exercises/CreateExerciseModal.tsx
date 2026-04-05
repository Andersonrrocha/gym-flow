"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import type { MuscleGroup, Equipment } from "@/types/workouts";

const muscleGroups: MuscleGroup[] = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "legs",
  "core",
  "glutes",
  "cardio",
];

const equipmentList: Equipment[] = [
  "barbell",
  "dumbbell",
  "cable",
  "machine",
  "bodyweight",
  "band",
  "kettlebell",
];

type CreateExerciseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    muscleGroup?: string;
    equipment?: string;
  }) => Promise<boolean>;
  labels: {
    title: string;
    nameLabel: string;
    namePlaceholder: string;
    nameRequired: string;
    muscleGroupLabel: string;
    muscleGroupPlaceholder: string;
    equipmentLabel: string;
    equipmentPlaceholder: string;
    create: string;
    cancel: string;
    creating: string;
  };
  translateMuscleGroup: (key: string) => string;
  translateEquipment: (key: string) => string;
};

export function CreateExerciseModal({
  isOpen,
  onClose,
  onCreate,
  labels,
  translateMuscleGroup,
  translateEquipment,
}: CreateExerciseModalProps) {
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [equipment, setEquipment] = useState("");
  const [nameError, setNameError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    queueMicrotask(() => {
      setName("");
      setMuscleGroup("");
      setEquipment("");
      setNameError(false);
      setSubmitting(false);
    });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError(true);
      return;
    }
    setSubmitting(true);
    const success = await onCreate({
      name: trimmed,
      muscleGroup: muscleGroup || undefined,
      equipment: equipment || undefined,
    });
    setSubmitting(false);
    if (success) onClose();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />

          <motion.div
            className="relative z-101 w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-base font-bold tracking-tight text-foreground">
              {labels.title}
            </h2>

            <div className="mt-4 flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  {labels.nameLabel}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError(false);
                  }}
                  placeholder={labels.namePlaceholder}
                  autoFocus
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                />
                {nameError && (
                  <p className="mt-1 text-xs text-destructive">
                    {labels.nameRequired}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  {labels.muscleGroupLabel}
                </label>
                <select
                  value={muscleGroup}
                  onChange={(e) => setMuscleGroup(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-base text-foreground outline-none focus:border-primary"
                >
                  <option value="">{labels.muscleGroupPlaceholder}</option>
                  {muscleGroups.map((mg) => (
                    <option key={mg} value={mg}>
                      {translateMuscleGroup(mg)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  {labels.equipmentLabel}
                </label>
                <select
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-base text-foreground outline-none focus:border-primary"
                >
                  <option value="">{labels.equipmentPlaceholder}</option>
                  {equipmentList.map((eq) => (
                    <option key={eq} value={eq}>
                      {translateEquipment(eq)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {labels.cancel}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
              >
                {submitting ? labels.creating : labels.create}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
