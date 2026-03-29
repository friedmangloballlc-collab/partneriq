import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

const GlobalSearch = forwardRef(function GlobalSearch(props, ref) {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current?.focus();
    },
  }));
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const { data: industries = [] } = useQuery({
    queryKey: ["industries"],
    queryFn: () => base44.entities.IndustryGuide.list(),
    enabled: isOpen,
  });

  const { data: cultureEvents = [] } = useQuery({
    queryKey: ["cultureEvents"],
    queryFn: () => base44.entities.CultureEvent.list(),
    enabled: isOpen,
  });

  const { data: megaEvents = [] } = useQuery({
    queryKey: ["megaEvents"],
    queryFn: () => base44.entities.MegaEvent.list(),
    enabled: isOpen,
  });

  const { data: demographics = [] } = useQuery({
    queryKey: ["demographics"],
    queryFn: () => base44.entities.DemographicSegment.list(),
    enabled: isOpen,
  });

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults(null);
      return;
    }

    setIsSearching(true);
    const term = searchTerm.toLowerCase();

    const industriesMatched = industries.filter(
      (i) =>
        i.industry?.toLowerCase().includes(term) ||
        i.sector?.toLowerCase().includes(term) ||
        i.best_demographics?.toLowerCase().includes(term)
    );

    const eventsMatched = [
      ...cultureEvents.filter((e) => e.event_name?.toLowerCase().includes(term)),
      ...megaEvents.filter((e) => e.event_name?.toLowerCase().includes(term)),
    ];

    const demographicsMatched = demographics.filter(
      (d) =>
        d.name?.toLowerCase().includes(term) ||
        d.population_size?.toLowerCase().includes(term) ||
        d.buying_power?.toLowerCase().includes(term)
    );

    setResults({
      industries: industriesMatched.slice(0, 5),
      events: eventsMatched.slice(0, 5),
      demographics: demographicsMatched.slice(0, 5),
    });
    setIsSearching(false);
  }, [searchTerm, industries, cultureEvents, megaEvents, demographics]);

  const handleResultClick = (resultType, id) => {
    setIsOpen(false);
    setSearchTerm("");
    
    if (resultType === "industry") {
      navigate(createPageUrl("DemographicTargeting"), { state: { selectedIndustry: id } });
    } else if (resultType === "event") {
      navigate(createPageUrl("EventManagement"), { state: { selectedEvent: id } });
    } else if (resultType === "demographic") {
      navigate(createPageUrl("DemographicTargeting"), { state: { selectedDemographic: id } });
    }
  };

  const hasResults =
    results &&
    (results.industries.length > 0 ||
      results.events.length > 0 ||
      results.demographics.length > 0);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search industries, events, demographics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          aria-label="Global search"
          className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg text-sm bg-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              setResults(null);
            }}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isSearching && (
            <div className="p-4 text-center text-slate-500 flex items-center justify-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              Searching...
            </div>
          )}

          {!isSearching && searchTerm && !hasResults && (
            <div className="p-4 text-center text-slate-500">No results found</div>
          )}

          {!isSearching && hasResults && (
            <>
              {results.industries.length > 0 && (
                <div className="border-b border-slate-200">
                  <div className="px-4 py-2 bg-slate-50 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Industries
                  </div>
                  {results.industries.map((industry) => (
                    <button
                      key={industry.id}
                      onClick={() => handleResultClick("industry", industry.id)}
                      className="w-full text-left px-4 py-2 hover:bg-indigo-50 border-b border-slate-100 last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-slate-900">{industry.industry}</div>
                      <div className="text-xs text-slate-500">{industry.sector}</div>
                    </button>
                  ))}
                </div>
              )}

              {results.events.length > 0 && (
                <div className="border-b border-slate-200">
                  <div className="px-4 py-2 bg-slate-50 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Events
                  </div>
                  {results.events.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => handleResultClick("event", event.id)}
                      className="w-full text-left px-4 py-2 hover:bg-indigo-50 border-b border-slate-100 last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-slate-900">{event.event_name}</div>
                      <div className="text-xs text-slate-500">
                        {event.dates || "Date TBA"}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.demographics.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-slate-50 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Demographics
                  </div>
                  {results.demographics.map((demo) => (
                    <button
                      key={demo.id}
                      onClick={() => handleResultClick("demographic", demo.id)}
                      className="w-full text-left px-4 py-2 hover:bg-indigo-50 border-b border-slate-100 last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-slate-900">{demo.name}</div>
                      <div className="text-xs text-slate-500">
                        {demo.population_size ? `Pop: ${demo.population_size}` : ""}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {!searchTerm && (
            <div className="p-4 text-center text-slate-500 text-sm">
              Type to search...
            </div>
          )}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
});

export default GlobalSearch;