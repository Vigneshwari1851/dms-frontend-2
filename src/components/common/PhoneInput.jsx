import { useState, useEffect, useRef } from "react";
import down from "../../assets/dashboard/down.svg";
import { fetchCountryCode } from "../../api/settings.jsx";

export default function PhoneInput({ value, onChange, error, className = "" }) {
    const [countries, setCountries] = useState([
        { name: "Tanzania", code: "+255", flag: "https://flagcdn.com/w320/tz.png" }
    ]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [selectedCountry, setSelectedCountry] = useState({ name: "Tanzania", code: "+255", flag: "https://flagcdn.com/w320/tz.png" });
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch("https://restcountries.com/v3.1/all?fields=name,idd,flags,cca2");
                const data = await response.json();

                const formatted = data
                    .filter(c => c.idd && c.idd.root)
                    .map(c => ({
                        name: c.name.common,
                        code: c.idd.root + (c.idd.suffixes?.[0] || ""),
                        flag: c.flags.svg || c.flags.png,
                        cca2: c.cca2
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name));

                setCountries(formatted);
                const detectedCode = await fetchCountryCode();
                if (detectedCode) {
                    const found = formatted.find(c => c.code === detectedCode);
                    if (found) setSelectedCountry(found);
                } else {
                    const tz = formatted.find(c => c.cca2 === "TZ");
                    if (tz) setSelectedCountry(tz);
                }
            } catch (error) {
                console.error("Error fetching dynamic countries:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCountries();
    }, []);

    useEffect(() => {
        if (value && countries.length > 1) {
            const found = countries.find(c => value.startsWith(c.code));
            if (found) {
                setSelectedCountry(found);
                setPhoneNumber(value.slice(found.code.length));
            } else {
                setPhoneNumber(value);
            }
        }
    }, [value, countries]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        setIsOpen(false);
        onChange(country.code + phoneNumber);
    };

    const handlePhoneChange = (e) => {
        const val = e.target.value.replace(/\D/g, "");
        if (val.length > 15) return;
        setPhoneNumber(val);
        onChange(selectedCountry.code + val);
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div className={`flex items-center bg-[#16191C] rounded-lg border ${error ? "border-red-500" : "border-transparent"} focus-within:border-blue-500 transition-all`}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-2 border-r border-[#2A2F33] hover:bg-[#1A1F24] transition-colors rounded-l-lg"
                >
                    <img src={selectedCountry.flag} alt="" className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
                    <span className="text-white text-sm font-medium">{selectedCountry.code}</span>
                    <img src={down} alt="" className={`w-2 h-2 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                <input
                    type="text"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="Enter phone number"
                    className="flex-1 bg-transparent px-3 py-2 text-white text-sm outline-none placeholder:text-[#505050]"
                />
            </div>

            {isOpen && (
                <ul className="absolute left-0 top-full mt-2 w-64 max-h-64 bg-[#1A1F24] border border-[#2A2F33] rounded-xl overflow-y-auto z-50 shadow-2xl scrollbar-grey animate-in fade-in slide-in-from-top-2 duration-200">
                    {countries.map((country) => (
                        <li
                            key={`${country.name}-${country.code}`}
                            onClick={() => handleCountrySelect(country)}
                            className="flex items-center justify-between px-4 py-3 hover:bg-[#2A2F33] cursor-pointer group transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <img src={country.flag} alt="" className="w-6 h-4 object-cover rounded-sm shadow-sm" />
                                <span className="text-white text-sm group-hover:text-blue-400 transition-colors truncate max-w-[120px]">{country.name}</span>
                            </div>
                            <span className="text-[#ABABAB] text-xs">{country.code}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
