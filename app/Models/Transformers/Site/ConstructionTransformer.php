<?php

namespace Koodilab\Models\Transformers\Site;

use Koodilab\Models\Grid;
use Koodilab\Models\Transformers\Transformer;

class ConstructionTransformer extends Transformer
{
    /**
     * @var BuildingTransformer
     */
    protected $buildingTransformer;

    /**
     * Constructor.
     *
     * @param BuildingTransformer $buildingTransformer
     */
    public function __construct(BuildingTransformer $buildingTransformer)
    {
        $this->buildingTransformer = $buildingTransformer;
    }

    /**
     * {@inheritdoc}
     *
     * @param Grid $item
     */
    public function transform($item)
    {
        return [
            'remaining' => $item->construction
                ? $item->construction->remaining
                : null,
            'buildings' => $this->buildings($item),
        ];
    }

    /**
     * Get the buildings.
     *
     * @param Grid $grid
     *
     * @return array
     */
    protected function buildings(Grid $grid)
    {
        $buildings = [];

        foreach ($grid->constructionBuildings() as $building) {
            $buildings[] = $this->buildingTransformer->transform($building);
        }

        return $buildings;
    }
}