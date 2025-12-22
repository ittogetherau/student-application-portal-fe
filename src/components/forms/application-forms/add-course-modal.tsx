"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

interface AddCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const formSchema = z.object({
    agent: z.string().min(1, "Please select an agent"),
    campus: z.string().min(1, "Please select a campus"),
    courseType: z.string().min(1, "Please select course type"),
    intakeYear: z.string().min(1, "Please select intake year"),
    course: z.string().min(1, "Please select a course"),
    startDate: z.string().min(1, "Please select start date"),
    advancedStanding: z.string().optional(),
});

const AddCourseModal = ({ isOpen, onClose }: AddCourseModalProps) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            agent: "",
            campus: "CIHE Parramatta Campus",
            courseType: "HigherEd",
            intakeYear: "2024",
            course: "",
            startDate: "",
            advancedStanding: "No",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-xl">
                <DialogHeader className="bg-primary px-7 py-5 flex flex-row items-center justify-between space-y-0">
                    <DialogTitle className="text-white font-bold text-lg tracking-tight">Add Course</DialogTitle>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-all hover:rotate-90 duration-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </DialogHeader>
                <div className="p-7 max-h-[85vh] overflow-y-auto custom-scrollbar">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <FormField
                                    control={form.control}
                                    name="agent"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="font-bold text-[13px] text-foreground/80 uppercase tracking-wider">Apply Under Agent</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-muted/30 border-muted/60 h-11 focus:ring-primary/20">
                                                        <SelectValue placeholder="Select agent ..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="agent1">Agent 1</SelectItem>
                                                    <SelectItem value="agent2">Agent 2</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[11px]" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="campus"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="font-bold text-[13px] text-foreground/80 uppercase tracking-wider">Which Campus</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-muted/30 border-muted/60 h-11 focus:ring-primary/20">
                                                        <SelectValue placeholder="Select campus ..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="CIHE Parramatta Campus">CIHE Parramatta Campus</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[11px]" />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <FormField
                                        control={form.control}
                                        name="courseType"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="font-bold text-[13px] text-foreground/80 uppercase tracking-wider">Course Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-muted/30 border-muted/60 h-11">
                                                            <SelectValue placeholder="Select type ..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="HigherEd">HigherEd</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[11px]" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="intakeYear"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="font-bold text-[13px] text-foreground/80 uppercase tracking-wider">Intake Year</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-muted/30 border-muted/60 h-11">
                                                            <SelectValue placeholder="Select year ..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="2024">2024</SelectItem>
                                                        <SelectItem value="2025">2025</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[11px]" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="course"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="font-bold text-[13px] text-foreground/80 uppercase tracking-wider">Select Course</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-muted/30 border-muted/60 h-11">
                                                        <SelectValue placeholder="Select course ..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="course1">Bachelor of Business- Major In Hospitality</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[11px]" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="font-bold text-[13px] text-foreground/80 uppercase tracking-wider">Preferred Start Date</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-muted/30 border-muted/60 h-11">
                                                        <SelectValue placeholder="Select Preferred Startdate ..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="date1">23/03/2026</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[11px]" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="pt-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-muted/60 mt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    className="w-full sm:w-auto px-8 border-muted-foreground/30 font-semibold h-11 transition-all active:scale-95"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 px-10 font-bold h-11 shadow-md shadow-primary/20 transition-all active:scale-95"
                                >
                                    Next
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddCourseModal;
