import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Variant_all_teacher_student,
  usePostSubjectNotice,
  useTeacherSubjects,
} from "../../hooks/useQueries";

export default function NoticesPanel() {
  const { data: subjects } = useTeacherSubjects();
  const postNotice = usePostSubjectNotice();

  const [form, setForm] = useState({
    subjectId: "",
    title: "",
    content: "",
    targetRole: Variant_all_teacher_student.all,
  });

  const handlePost = async () => {
    if (!form.subjectId || !form.title.trim() || !form.content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await postNotice.mutateAsync({
        subjectId: form.subjectId,
        title: form.title,
        content: form.content,
        targetRole: form.targetRole,
      });
      toast.success("Notice posted successfully!");
      setForm({
        subjectId: "",
        title: "",
        content: "",
        targetRole: Variant_all_teacher_student.all,
      });
    } catch {
      toast.error("Failed to post notice");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bell size={20} className="text-muted-foreground" />
        <h2 className="font-display font-semibold text-foreground">
          Post Subject Notice
        </h2>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-base">New Notice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Subject</Label>
            <Select
              value={form.subjectId}
              onValueChange={(v) => setForm((p) => ({ ...p, subjectId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects?.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block">Target Audience</Label>
            <Select
              value={form.targetRole}
              onValueChange={(v) =>
                setForm((p) => ({
                  ...p,
                  targetRole: v as Variant_all_teacher_student,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Variant_all_teacher_student.all}>
                  All
                </SelectItem>
                <SelectItem value={Variant_all_teacher_student.student}>
                  Students Only
                </SelectItem>
                <SelectItem value={Variant_all_teacher_student.teacher}>
                  Teachers Only
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block">Notice Title</Label>
            <Input
              placeholder="e.g., Assignment deadline extended"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
            />
          </div>
          <div>
            <Label className="mb-2 block">Notice Content</Label>
            <Textarea
              placeholder="Write your notice here..."
              value={form.content}
              onChange={(e) =>
                setForm((p) => ({ ...p, content: e.target.value }))
              }
              rows={4}
            />
          </div>
          <Button
            onClick={handlePost}
            disabled={postNotice.isPending}
            className="gap-2"
            style={{ background: "oklch(0.45 0.14 155)" }}
          >
            {postNotice.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            Post Notice
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
