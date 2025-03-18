import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { insertHolidayRequestSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInBusinessDays, addDays } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

const holidayFormSchema = insertHolidayRequestSchema
  .extend({
    startDate: z.date({
      required_error: "A start date is required",
    }),
    endDate: z.date({
      required_error: "An end date is required",
    }),
  })
  .refine(
    (data) => {
      return data.startDate <= data.endDate;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

type HolidayFormValues = z.infer<typeof holidayFormSchema>;

interface HolidayFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HolidayForm({ isOpen, onClose }: HolidayFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const form = useForm<HolidayFormValues>({
    resolver: zodResolver(holidayFormSchema),
    defaultValues: {
      userId: user?.id,
      startDate: undefined,
      endDate: undefined,
      duration: 0,
      reason: "",
    },
  });

  const calculateDuration = (from: Date, to: Date) => {
    const businessDays = differenceInBusinessDays(to, from) + 1;
    return businessDays > 0 ? businessDays : 1; // Minimum of 1 day
  };

  // Update duration when dates change
  const onDatesChange = (from: Date | undefined, to: Date | undefined) => {
    if (from && to) {
      const duration = calculateDuration(from, to);
      form.setValue("duration", duration);
    }
  };

  const holidayMutation = useMutation({
    mutationFn: async (data: HolidayFormValues) => {
      const response = await apiRequest("POST", "/api/holiday-requests", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Holiday request submitted",
        description: "Your request has been submitted for approval.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/holiday-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to submit request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: HolidayFormValues) => {
    if (!user) return;

    const formattedData = {
      ...data,
      userId: user.id,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    };

    holidayMutation.mutate(formattedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Holiday Request</DialogTitle>
          <DialogDescription>
            Submit a new holiday request for approval.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            const to = form.getValues("endDate");
                            if (date && to) {
                              onDatesChange(date, to);
                            }
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            const from = form.getValues("startDate");
                            if (from && date) {
                              onDatesChange(from, date);
                            }
                          }}
                          disabled={(date) => {
                            const startDate = form.getValues("startDate");
                            return (
                              date < new Date() ||
                              (startDate ? date < startDate : false)
                            );
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (Working Days)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={1}
                      disabled
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Automatically calculated from selected dates.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief explanation for your holiday request"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={holidayMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={holidayMutation.isPending}>
                {holidayMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
