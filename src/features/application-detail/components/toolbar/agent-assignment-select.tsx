"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, ChevronsUpDown, OctagonAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import {
  useApplicationAssignAgentMutation,
  useStaffAgentsQuery,
} from "../../hooks/useStaffAgents.hook";

interface AgentAssignmentSelectProps {
  applicationId: string;
  assignedAgentProfileId?: string | null;
  assignedAgentEmail?: string | null;
  mode?: "dropdown" | "list";
  onAssigned?: () => void;
}

export function AgentAssignmentSelect({
  applicationId,
  assignedAgentProfileId = null,
  assignedAgentEmail = null,
  mode = "dropdown",
  onAssigned,
}: AgentAssignmentSelectProps) {
  const [open, setOpen] = useState(false);
  const { data: agentsResponse, isLoading: isAgentsLoading } =
    useStaffAgentsQuery();
  const assignMutation = useApplicationAssignAgentMutation(applicationId);

  const agents = useMemo(
    () => agentsResponse?.data || [],
    [agentsResponse?.data],
  );

  const currentAgentId = useMemo(() => {
    if (assignedAgentProfileId) return assignedAgentProfileId;
    if (!assignedAgentEmail) return null;
    const agentMatch = agents.find(
      (agent) =>
        agent.email &&
        agent.email.toLowerCase() === assignedAgentEmail.toLowerCase(),
    );
    return agentMatch?.agent_profile_id || agentMatch?.id || null;
  }, [agents, assignedAgentEmail, assignedAgentProfileId]);

  const currentAgent = useMemo(() => {
    if (!currentAgentId) return null;
    return (
      agents.find(
        (a) => a.agent_profile_id === currentAgentId || a.id === currentAgentId,
      ) || null
    );
  }, [agents, currentAgentId]);

  const handleAssign = (agentId: string | null) => {
    assignMutation.mutate(agentId, {
      onSuccess: () => {
        toast.success(agentId ? "Agent assigned." : "Agent unassigned.");
        setOpen(false);
        onAssigned?.();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to assign agent");
      },
    });
  };

  if (mode === "list") {
    return (
      <Command>
        <CommandInput placeholder="Search by email..." className="h-9" />
        <CommandList>
          <CommandEmpty>No agent found.</CommandEmpty>
          <CommandGroup>
            <CommandItem value="unassigned" onSelect={() => handleAssign(null)}>
              <Check
                className={`mr-2 h-4 w-4 ${
                  !currentAgentId ? "opacity-100" : "opacity-0"
                }`}
              />
              <span className="text-foreground">Unassigned</span>
            </CommandItem>
            {agents.map((agent) => {
              const assignId = agent.agent_profile_id || agent.id;
              const meta =
                agent.agency_name || agent.contact_person || agent.phone;

              return (
                <CommandItem
                  key={agent.id}
                  value={`${agent.email} ${agent.agency_name || ""}`}
                  onSelect={() => handleAssign(assignId)}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      currentAgentId === assignId ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <div className="flex flex-col text-foreground min-w-0">
                    <span className="truncate">{agent.email}</span>
                    {meta ? (
                      <span className="text-xs text-muted-foreground truncate">
                        {meta}
                      </span>
                    ) : null}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    );
  }

  return (
    <div className="flex items-center gap-1 min-w-0 w-full relative">
      {!(assignedAgentProfileId || assignedAgentEmail) && (
        <div className="absolute top-1/2 -translate-y-1/2 right-6 animate-scale-pulse">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={"ghost"}
                size={"icon-xs"}
                className="text-destructive"
              >
                <OctagonAlert />
              </Button>
            </TooltipTrigger>
            <TooltipContent>No agent is assigned.</TooltipContent>
          </Tooltip>
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={assignMutation.isPending}
            className="flex-1 min-w-0 h-8 justify-between text-sm"
          >
            {assignMutation.isPending ? (
              "Loading..."
            ) : currentAgent ? (
              <span className="block w-full truncate">
                {currentAgent.email}
              </span>
            ) : assignedAgentEmail ? (
              <span className="block w-full truncate">
                {assignedAgentEmail}
              </span>
            ) : isAgentsLoading ? (
              "Loading..."
            ) : (
              <span className="text-foreground">Assign Agent</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="center">
          <Command>
            <CommandInput placeholder="Search by email..." className="h-9" />
            <CommandList>
              <CommandEmpty>No agent found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="unassigned"
                  onSelect={() => handleAssign(null)}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      !currentAgentId ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <span className="text-foreground">Unassigned</span>
                </CommandItem>
                {agents.map((agent) => {
                  const assignId = agent.agent_profile_id || agent.id;
                  const meta =
                    agent.agency_name || agent.contact_person || agent.phone;

                  return (
                    <CommandItem
                      key={agent.id}
                      value={`${agent.email} ${agent.agency_name || ""}`}
                      onSelect={() => handleAssign(assignId)}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          currentAgentId === assignId
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      />
                      <div className="flex flex-col text-foreground min-w-0">
                        <span className="truncate">{agent.email}</span>
                        {meta ? (
                          <span className="text-xs text-muted-foreground truncate">
                            {meta}
                          </span>
                        ) : null}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
