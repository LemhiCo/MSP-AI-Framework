import { useQuery } from "@tanstack/react-query";
import { loadControls, loadAssessment, type Control, type AssessmentRow } from "@/lib/csv-loader";

export function useControls() {
  return useQuery<Control[]>({
    queryKey: ["controls"],
    queryFn: loadControls,
    staleTime: Infinity,
  });
}

export function useAssessment() {
  return useQuery<AssessmentRow[]>({
    queryKey: ["assessment"],
    queryFn: loadAssessment,
    staleTime: Infinity,
  });
}
