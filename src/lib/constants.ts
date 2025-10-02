export const PROJECT_TYPES = {
  solar: 'Solar Panel Installation',
  wind: 'Wind Turbine Maintenance',
  boiler: 'Industrial Boiler Upgrade',
  lighting: 'Smart Lighting System',
};

export const PROJECT_MILESTONES: Record<string, { id: string; name: string; description: string }[]> = {
  solar: [
    { id: 'solar-1', name: 'Site Survey & Assessment', description: 'Conduct a detailed analysis of the installation site.' },
    { id: 'solar-2', name: 'System Design & Engineering', description: 'Create final blueprints and electrical diagrams.' },
    { id: 'solar-3', name: 'Permitting & Approvals', description: 'Obtain all necessary local and utility permits.' },
    { id: 'solar-4', name: 'Equipment Procurement', description: 'Order and receive all panels, inverters, and mounting hardware.' },
    { id: 'solar-5', name: 'Installation', description: 'Mount panels, install inverters, and run all wiring.' },
    { id: 'solar-6', name: 'Inspection & Commissioning', description: 'Final inspection by authorities and system activation.' },
  ],
  wind: [
    { id: 'wind-1', name: 'Initial Safety Inspection', description: 'Full safety check before beginning maintenance.' },
    { id: 'wind-2', name: 'Blade & Nacelle Inspection', description: 'Inspect blades and nacelle for wear and tear.' },
    { id: 'wind-3', name: 'Gearbox & Drivetrain Service', description: 'Service the gearbox and drivetrain components.' },
    { id: 'wind-4', name: 'System Diagnostics', description: 'Run full diagnostics on the turbine control systems.' },
    { id: 'wind-5', name: 'Final Testing & Report', description: 'Test turbine performance and generate maintenance report.' },
  ],
  boiler: [
    { id: 'boiler-1', name: 'Old System Decommissioning', description: 'Safely shut down and dismantle the old boiler system.' },
    { id: 'boiler-2', name: 'Site Preparation', description: 'Prepare the site for the new industrial boiler installation.' },
    { id: 'boiler-3', name: 'New Boiler Installation', description: 'Install and connect the new boiler unit.' },
    { id: 'boiler-4', name: 'System Integration & Testing', description: 'Integrate with existing systems and perform initial tests.' },
    { id: 'boiler-5', name: 'Commissioning & Handover', description: 'Final system commissioning and handover to the client.' },
  ],
  lighting: [
    { id: 'lighting-1', name: 'Area Survey & Light Study', description: 'Conduct a study of the area to determine lighting needs.' },
    { id: 'lighting-2', name: 'System Design', description: 'Design the smart lighting layout and control system.' },
    { id: 'lighting-3', name: 'Fixture Installation', description: 'Install all new smart lighting fixtures.' },
    { id: 'lighting-4', name: 'Control System Configuration', description: 'Configure sensors, schedules, and remote access.' },
    { id: 'lighting-5', name: 'Final Commissioning', description: 'Test the entire system and confirm functionality.' },
  ],
};
