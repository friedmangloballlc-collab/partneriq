import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Search,
  Network,
  Users,
  Building2,
  ArrowRight,
  Bell,
  Loader2,
  ChevronRight,
  UserCircle,
  Star,
} from "lucide-react";
import { createPageUrl } from "@/utils";

// ─── Graph computation ────────────────────────────────────────────────────────

/**
 * Build a bipartite adjacency map from partnerships:
 *   brandToTalents: brand_name -> Set<talent_name>
 *   talentToBrands: talent_name -> Set<brand_name>
 */
function buildGraph(partnerships) {
  const brandToTalents = {};
  const talentToBrands = {};

  for (const p of partnerships) {
    const brand = p.brand_name?.trim();
    const talent = p.talent_name?.trim();
    if (!brand || !talent) continue;

    if (!brandToTalents[brand]) brandToTalents[brand] = new Set();
    brandToTalents[brand].add(talent);

    if (!talentToBrands[talent]) talentToBrands[talent] = new Set();
    talentToBrands[talent].add(brand);
  }

  return { brandToTalents, talentToBrands };
}

/**
 * Find all people connected to `origin` through shared brands.
 * Returns Map<talentName, { mutualBrands: string[] }>
 */
function findConnections(origin, brandToTalents, talentToBrands) {
  const myBrands = talentToBrands[origin] || new Set();
  const connections = new Map();

  for (const brand of myBrands) {
    const coTalents = brandToTalents[brand] || new Set();
    for (const talent of coTalents) {
      if (talent === origin) continue;
      if (!connections.has(talent)) {
        connections.set(talent, { mutualBrands: [] });
      }
      connections.get(talent).mutualBrands.push(brand);
    }
  }

  return connections;
}

/**
 * BFS to find shortest path between two talents through brand nodes.
 * Returns array of steps: [{type:'talent'|'brand', name}] or null.
 * Limit depth to 3 hops for MVP.
 */
function findPath(fromTalent, toTarget, brandToTalents, talentToBrands) {
  // Direct brand connection (1 hop)
  const directBrands = Array.from(talentToBrands[fromTalent] || []);

  // Check if target is a brand
  if (brandToTalents[toTarget]) {
    if ((talentToBrands[fromTalent] || new Set()).has(toTarget)) {
      return [
        { type: "talent", name: fromTalent },
        { type: "brand", name: toTarget },
      ];
    }
  }

  // Check 1 hop: You -> Brand -> Target talent
  for (const brand of directBrands) {
    const coTalents = brandToTalents[brand] || new Set();
    if (coTalents.has(toTarget)) {
      return [
        { type: "talent", name: fromTalent },
        { type: "brand", name: brand },
        { type: "talent", name: toTarget },
      ];
    }
  }

  // Check 2 hops: You -> Brand -> Mutual -> Brand2 -> Target
  for (const brand of directBrands) {
    const mutuals = Array.from(brandToTalents[brand] || []);
    for (const mutual of mutuals) {
      if (mutual === fromTalent) continue;
      const mutualBrands = Array.from(talentToBrands[mutual] || []);
      for (const brand2 of mutualBrands) {
        if (brand2 === brand) continue;
        const targets = brandToTalents[brand2] || new Set();
        if (targets.has(toTarget)) {
          return [
            { type: "talent", name: fromTalent },
            { type: "brand", name: brand },
            { type: "talent", name: mutual },
            { type: "brand", name: brand2 },
            { type: "talent", name: toTarget },
          ];
        }
      }
    }
  }

  return null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NodePill({ node, onClick }) {
  const isBrand = node.type === "brand";
  return (
    <button
      onClick={() => onClick(node)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors hover:shadow-sm ${
        isBrand
          ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
      }`}
    >
      {isBrand ? (
        <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
      ) : (
        <UserCircle className="w-3.5 h-3.5 flex-shrink-0" />
      )}
      <span className="max-w-[140px] truncate">{node.name}</span>
    </button>
  );
}

function PathResult({ path, onNodeClick, onRequestIntro, isRequesting, currentUserName }) {
  const degree = Math.floor((path.length - 1) / 2);
  const targetNode = path[path.length - 1];
  const mutualNode = path.length >= 3 ? path[Math.floor(path.length / 2)] : null;

  return (
    <Card className="border-slate-200/60">
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-col gap-3">
          {/* Degree badge */}
          <div className="flex items-center justify-between">
            <Badge
              className={`text-xs font-medium border ${
                degree === 1
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : degree === 2
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              {degree === 1 ? "1st degree" : degree === 2 ? "2nd degree" : `${degree}rd degree`} connection
            </Badge>
            <span className="text-xs text-slate-400">{path.length - 1} hop{path.length - 1 !== 1 ? "s" : ""}</span>
          </div>

          {/* Path visualization */}
          <div className="flex items-center gap-2 flex-wrap">
            {path.map((node, i) => (
              <React.Fragment key={i}>
                {i === 0 ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-slate-800 text-white border border-slate-700">
                    <UserCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>You</span>
                  </div>
                ) : (
                  <NodePill node={node} onClick={onNodeClick} />
                )}
                {i < path.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Description */}
          <p className="text-xs text-slate-500">
            {degree === 1 && mutualNode?.type === "brand"
              ? `You both worked with ${mutualNode.name}.`
              : mutualNode
              ? `Connected through ${mutualNode.name}.`
              : "Connected on the platform."}
          </p>

          {/* Request Intro button (only if mutual talent node exists) */}
          {degree >= 1 && mutualNode && (
            <Button
              size="sm"
              onClick={() => onRequestIntro(targetNode, mutualNode)}
              disabled={isRequesting}
              className="bg-indigo-600 hover:bg-indigo-700 w-fit"
            >
              {isRequesting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
              ) : (
                <Bell className="w-3.5 h-3.5 mr-2" />
              )}
              Request Intro via {mutualNode.name}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ConnectionCard({ talentName, mutualBrands, onNavigate, onRequestIntro, isRequesting }) {
  return (
    <Card className="border-slate-200/60 hover:border-indigo-200/80 transition-colors">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
              <UserCircle className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <button
                onClick={() => onNavigate(talentName)}
                className="text-sm font-semibold text-slate-800 hover:text-indigo-600 transition-colors text-left"
              >
                {talentName}
              </button>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {mutualBrands.slice(0, 3).map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100"
                  >
                    <Building2 className="w-2.5 h-2.5" />
                    {b}
                  </span>
                ))}
                {mutualBrands.length > 3 && (
                  <span className="text-[10px] text-slate-400">+{mutualBrands.length - 3} more</span>
                )}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRequestIntro(talentName, mutualBrands[0])}
            disabled={isRequesting}
            className="text-xs flex-shrink-0 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            {isRequesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bell className="w-3 h-3 mr-1" />}
            Intro
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WarmIntroNetwork() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState("");
  const [requestingIntro, setRequestingIntro] = useState(null);

  // Fetch all partnerships to build graph
  const { data: partnerships = [], isLoading } = useQuery({
    queryKey: ["partnerships_graph"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partnerships")
        .select("brand_name, talent_name, talent_id, brand_id, id")
        .not("brand_name", "is", null)
        .not("talent_name", "is", null);
      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });

  // Build graph
  const { brandToTalents, talentToBrands } = useMemo(
    () => buildGraph(partnerships),
    [partnerships]
  );

  // Determine current user's talent name from partnerships
  const currentUserName = useMemo(() => {
    if (!currentUser) return null;
    const mine = partnerships.find(
      (p) =>
        p.talent_id === currentUser.id ||
        p.talent_name?.toLowerCase() === currentUser.full_name?.toLowerCase() ||
        p.talent_name?.toLowerCase().includes(currentUser.email?.split("@")[0]?.toLowerCase())
    );
    return mine?.talent_name || currentUser.full_name || currentUser.email?.split("@")[0] || "You";
  }, [partnerships, currentUser]);

  // All connections for the current user
  const myConnections = useMemo(() => {
    if (!currentUserName) return new Map();
    return findConnections(currentUserName, brandToTalents, talentToBrands);
  }, [currentUserName, brandToTalents, talentToBrands]);

  // Stats
  const stats = useMemo(() => {
    const myBrands = talentToBrands[currentUserName] || new Set();
    return {
      connections: myConnections.size,
      brands: myBrands.size,
    };
  }, [myConnections, talentToBrands, currentUserName]);

  // Search path result
  const pathResult = useMemo(() => {
    if (!searchSubmitted.trim() || !currentUserName) return null;
    return findPath(currentUserName, searchSubmitted.trim(), brandToTalents, talentToBrands);
  }, [searchSubmitted, currentUserName, brandToTalents, talentToBrands]);

  // Filtered connections list
  const filteredConnections = useMemo(() => {
    if (searchSubmitted && !pathResult) {
      // Show connections whose name includes search
      const q = searchSubmitted.toLowerCase();
      return Array.from(myConnections.entries()).filter(([name]) =>
        name.toLowerCase().includes(q)
      );
    }
    if (!searchSubmitted) {
      return Array.from(myConnections.entries());
    }
    return [];
  }, [myConnections, searchSubmitted, pathResult]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchSubmitted(searchQuery.trim());
  };

  const handleNodeClick = (node) => {
    if (node.type === "talent") {
      navigate(createPageUrl("TalentDiscovery") + `?search=${encodeURIComponent(node.name)}`);
    } else {
      navigate(createPageUrl("Brands") + `?search=${encodeURIComponent(node.name)}`);
    }
  };

  const handleNavigateToTalent = (name) => {
    navigate(createPageUrl("TalentDiscovery") + `?search=${encodeURIComponent(name)}`);
  };

  const handleRequestIntro = async (targetNodeOrName, mutualNodeOrBrand) => {
    const targetName = typeof targetNodeOrName === "string" ? targetNodeOrName : targetNodeOrName.name;
    const mutualName = typeof mutualNodeOrBrand === "string" ? mutualNodeOrBrand : mutualNodeOrBrand.name;

    setRequestingIntro(targetName);
    try {
      const { error } = await supabase.from("notifications").insert({
        user_id: currentUser?.id,
        type: "intro_request",
        title: "Warm Intro Requested",
        message: `${currentUserName} would like an introduction to ${targetName} through ${mutualName}.`,
        metadata: {
          requester: currentUserName,
          target: targetName,
          mutual: mutualName,
        },
        read: false,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast({
        title: "Intro request sent",
        description: `Notification sent via ${mutualName}.`,
      });
    } catch (err) {
      toast({
        title: "Could not send request",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setRequestingIntro(null);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Network className="w-6 h-6 text-indigo-500" />
          Warm Intro Network
        </h1>
        <p className="text-sm text-slate-500">
          Discover who you are connected to through shared brand partnerships.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200/60">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {isLoading ? "—" : stats.connections}
                </p>
                <p className="text-xs text-slate-500">Connections</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/60">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {isLoading ? "—" : stats.brands}
                </p>
                <p className="text-xs text-slate-500">Brands Reachable</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/60">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Star className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {isLoading ? "—" : Object.keys(brandToTalents).length}
                </p>
                <p className="text-xs text-slate-500">Platform Brands</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/60">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Network className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {isLoading ? "—" : Object.keys(talentToBrands).length}
                </p>
                <p className="text-xs text-slate-500">Platform Talent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search bar */}
      <Card className="border-slate-200/60">
        <CardContent className="pt-4 pb-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Find connection path to... (brand or person name)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              <Search className="w-4 h-4 mr-2" />
              Find Path
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Path result */}
      {!isLoading && searchSubmitted && pathResult && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700">Connection path found</h2>
          <PathResult
            path={pathResult}
            onNodeClick={handleNodeClick}
            onRequestIntro={handleRequestIntro}
            isRequesting={!!requestingIntro}
            currentUserName={currentUserName}
          />
        </div>
      )}

      {/* No path found */}
      {!isLoading && searchSubmitted && !pathResult && filteredConnections.length === 0 && (
        <Card className="border-slate-200/60">
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-3 text-center">
            <Network className="w-10 h-10 text-slate-200" />
            <p className="text-slate-500 text-sm font-medium">No connection path found</p>
            <p className="text-slate-400 text-xs max-w-sm">
              No shared brand relationships found between you and "{searchSubmitted}". As more deals are
              added, your network expands automatically.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Connections list */}
      {!isLoading && (
        <div className="space-y-3">
          {filteredConnections.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700">
                  {searchSubmitted ? `Results for "${searchSubmitted}"` : "Your Network"}{" "}
                  <span className="text-slate-400 font-normal">({filteredConnections.length})</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredConnections.map(([name, { mutualBrands }]) => (
                  <ConnectionCard
                    key={name}
                    talentName={name}
                    mutualBrands={mutualBrands}
                    onNavigate={handleNavigateToTalent}
                    onRequestIntro={handleRequestIntro}
                    isRequesting={requestingIntro === name}
                  />
                ))}
              </div>
            </>
          )}

          {!searchSubmitted && myConnections.size === 0 && (
            <Card className="border-slate-200/60">
              <CardContent className="pt-8 pb-8 flex flex-col items-center gap-3 text-center">
                <Network className="w-10 h-10 text-slate-200" />
                <p className="text-slate-500 text-sm font-medium">No connections yet</p>
                <p className="text-slate-400 text-xs max-w-sm">
                  Your network grows as you and others complete partnerships with shared brands. Start by
                  adding deals in Partnerships.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(createPageUrl("Partnerships"))}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Go to Partnerships
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
