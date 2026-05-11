const fs = require('fs');
let code = fs.readFileSync('src/features/agents/components/agents-page.tsx', 'utf8');

// remove statcards definition
const statCardsRegex = /const statCards\s*=\s*\[[\s\S]*?\]\s*as\s*const;/m;
code = code.replace(statCardsRegex, '');

// replace header and stat cards
const startTag = '<Card className="overflow-hidden border-0 bg-linear-to-r';
const endTag = '</div>';
const regex = /<Card className="overflow-hidden border-0 bg-linear-to-r[\s\S]*?<\/div>\s*<\/Card>\s*<\/div>/m;

const replacement = \<Card className="bg-card text-card-foreground">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
              Build Your Sub-Agent Team
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Create and grow your internal hierarchy by onboarding sub-agents under your current organization profile.
            </p>
          </div>
          <CreateSubAgentDialog onCreated={handleCreated} />
        </CardContent>
      </Card>\;

code = code.replace(regex, replacement);

fs.writeFileSync('src/features/agents/components/agents-page.tsx', code);
