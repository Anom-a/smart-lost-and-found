<?php

namespace App\Support\Console;

use Illuminate\Console\View\Components\Factory;
use Symfony\Component\Console\Output\OutputInterface;

class PlainComponentsFactory extends Factory
{
    public function __call($method, $parameters)
    {
        if (in_array($method, ['ask', 'askWithCompletion', 'choice', 'confirm'], true)) {
            return $parameters[1] ?? null;
        }

        if ($method === 'task') {
            $description = $parameters[0] ?? '';
            $task = $parameters[1] ?? null;

            if (is_callable($task)) {
                $task();
            }

            $this->output->writeln($description, $parameters[2] ?? OutputInterface::VERBOSITY_NORMAL);

            return null;
        }

        if ($method === 'bulletList') {
            foreach ($parameters[0] ?? [] as $item) {
                $this->output->writeln('- '.$item, $parameters[1] ?? OutputInterface::VERBOSITY_NORMAL);
            }

            return null;
        }

        if ($method === 'twoColumnDetail') {
            $this->output->writeln(trim(($parameters[0] ?? '').' '.($parameters[1] ?? '')), $parameters[2] ?? OutputInterface::VERBOSITY_NORMAL);

            return null;
        }

        $message = $method === 'line'
            ? ($parameters[1] ?? '')
            : ($parameters[0] ?? '');

        $verbosity = $method === 'line'
            ? ($parameters[2] ?? OutputInterface::VERBOSITY_NORMAL)
            : ($parameters[1] ?? OutputInterface::VERBOSITY_NORMAL);

        $this->output->writeln((string) $message, $verbosity);

        return null;
    }
}
