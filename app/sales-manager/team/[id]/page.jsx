"use client";
import React from "react";
import MyTeamDashboardView from "@/components/MyTeamDashboardView";
import { useParams } from "next/navigation";

const TeamDetailsPage = () => {
    const params = useParams();
    const teamId = params.id;

    return <MyTeamDashboardView teamId={teamId} />;
};

export default TeamDetailsPage;
